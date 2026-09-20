const mysql = require('mysql2/promise');
const { validateEnvironment } = require('../config/env');
const { connectDatabase, disconnectDatabase } = require('../config/database');
const Counter = require('../models/Counter');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { CATEGORIES, LEGACY_CATEGORY_CODES } = require('../constants/catalog');

const statusMap = {
  '-1': 'cancelled',
  0: 'pending',
  1: 'preparing',
  2: 'ready_for_delivery',
  3: 'delivering',
  4: 'completed',
  5: 'failed'
};

function code(prefix, value, size = 4) {
  return `${prefix}${String(value).padStart(size, '0')}`;
}

async function bulkUpsert(Model, rows, identity, makeUpdate) {
  if (!rows.length) return;
  await Model.bulkWrite(rows.map((row) => ({
    updateOne: {
      filter: identity(row),
      update: { $set: makeUpdate(row) },
      upsert: true
    }
  })));
}

async function migrate() {
  validateEnvironment();
  const sql = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'jollibee_db',
    charset: 'utf8mb4'
  });

  try {
    await connectDatabase();
    const [employees] = await sql.query('SELECT * FROM NhanVien');
    const [customers] = await sql.query('SELECT * FROM KhachHang');
    const [products] = await sql.query('SELECT * FROM MonAn');
    const [orders] = await sql.query('SELECT * FROM DonHang');
    const [orderItems] = await sql.query('SELECT * FROM ChiTietDonHang');

    await Category.bulkWrite(CATEGORIES.map((category) => ({
      updateOne: {
        filter: { code: category.code },
        update: { $set: { ...category, isActive: true } },
        upsert: true
      }
    })));

    await bulkUpsert(
      Employee,
      employees,
      (row) => ({ employeeCode: code('NV', row.MaNV) }),
      (row) => ({
        employeeCode: code('NV', row.MaNV),
        fullName: row.TenNV,
        phone: row.SDT || '',
        birthDate: row.NgaySinh || null,
        gender: ['Nam', 'Nữ', 'Khác'].includes(row.GioiTinh) ? row.GioiTinh : '',
        email: row.Email || '',
        hometown: row.QueQuan || ''
      })
    );

    const highestEmployeeId = employees.reduce((max, row) => Math.max(max, Number(row.MaNV) || 0), 0);
    await Counter.findByIdAndUpdate(
      'employee',
      { $max: { sequence: highestEmployeeId } },
      { upsert: true }
    );

    await bulkUpsert(
      Customer,
      customers,
      (row) => ({ customerCode: code('KH', row.MaKH) }),
      (row) => ({
        customerCode: code('KH', row.MaKH),
        fullName: row.TenKH || 'Khách lẻ',
        phone: row.SDT || '',
        address: row.DiaChi || ''
      })
    );

    const highestCustomerId = customers.reduce((max, row) => Math.max(max, Number(row.MaKH) || 0), 0);
    await Counter.findByIdAndUpdate('customer', { $max: { sequence: highestCustomerId } }, { upsert: true });

    const mongoCategories = await Category.find().select('_id code').lean();
    const categoryIds = new Map(mongoCategories.map((item) => [item.code, item._id]));
    const categoryCodeFor = (value) => {
      if (!value) return '';
      return LEGACY_CATEGORY_CODES[value] || String(value);
    };

    await bulkUpsert(
      Product,
      products,
      (row) => ({ productCode: code('MON', row.MaMon) }),
      (row) => {
        const categoryCode = categoryCodeFor(row.MaLoai);
        return {
          productCode: code('MON', row.MaMon),
          name: row.TenMon,
          price: Number(row.Gia) || 0,
          costPrice: 0,
          stock: Number(row.SoLuong) || 0,
          unit: 'phần',
          reorderLevel: 10,
          image: row.HinhAnh || '',
          isActive: Number(row.TrangThai) === 1,
          category: categoryIds.get(categoryCode) || null,
          categoryCode
        };
      }
    );

    const highestProductId = products.reduce((max, row) => Math.max(max, Number(row.MaMon) || 0), 0);
    await Counter.findByIdAndUpdate('product', { $max: { sequence: highestProductId } }, { upsert: true });

    const [mongoCustomers, mongoProducts] = await Promise.all([
      Customer.find().select('_id customerCode').lean(),
      Product.find().select('_id productCode').lean()
    ]);
    const customerIds = new Map(mongoCustomers.map((item) => [item.customerCode, item._id]));
    const productIds = new Map(mongoProducts.map((item) => [item.productCode, item._id]));
    const productRows = new Map(products.map((item) => [String(item.MaMon), item]));
    const itemsByOrder = new Map();

    orderItems.forEach((item) => {
      const orderId = String(item.MaDH);
      const product = productRows.get(String(item.MaMon));
      const items = itemsByOrder.get(orderId) || [];
      items.push({
        product: productIds.get(code('MON', item.MaMon)),
        productCode: code('MON', item.MaMon),
        categoryCode: categoryCodeFor(product?.MaLoai),
        name: product?.TenMon || `Món ${item.MaMon}`,
        quantity: Number(item.SoLuongMua) || 1,
        unitPrice: Number(item.GiaMua) || 0,
        costPrice: 0,
        lineTotal: (Number(item.SoLuongMua) || 1) * (Number(item.GiaMua) || 0)
      });
      itemsByOrder.set(orderId, items);
    });

    const customerRows = new Map(customers.map((item) => [String(item.MaKH), item]));
    await bulkUpsert(
      Order,
      orders,
      (row) => ({ orderCode: code('DH', row.MaDH, 6) }),
      (row) => ({
        orderCode: code('DH', row.MaDH, 6),
        customer: customerIds.get(code('KH', row.MaKH)),
        customerName: customerRows.get(String(row.MaKH))?.TenKH || 'Khách lẻ',
        customerPhone: customerRows.get(String(row.MaKH))?.SDT || '',
        orderedAt: row.NgayDat || new Date(),
        completedAt: Number(row.TrangThai) === 4 ? (row.NgayDat || new Date()) : null,
        cancelledAt: Number(row.TrangThai) === -1 ? (row.NgayDat || new Date()) : null,
        subtotal: Number(row.TongTien) || 0,
        total: Number(row.TongTien) || 0,
        deliveryAddress: row.DiaChiGiao || '',
        status: statusMap[String(row.TrangThai)] || 'pending',
        orderType: Number(row.LoaiDon) === 1 ? 'delivery' : 'dine_in',
        source: 'legacy',
        branchCode: 'MAIN',
        payment: {
          method: Number(row.LoaiDon) === 1 ? 'cod' : 'cash',
          status: Number(row.TrangThai) === 4 ? 'paid' : 'unpaid'
        },
        items: itemsByOrder.get(String(row.MaDH)) || [],
        statusHistory: [{
          status: statusMap[String(row.TrangThai)] || 'pending',
          note: 'Trạng thái được chuyển từ hệ thống MySQL cũ',
          changedAt: row.NgayDat || new Date()
        }]
      })
    );

    const highestOrderId = orders.reduce((max, row) => Math.max(max, Number(row.MaDH) || 0), 0);
    await Counter.findByIdAndUpdate('order', { $max: { sequence: highestOrderId } }, { upsert: true });

    console.log(`Đã chuyển ${employees.length} nhân viên, ${customers.length} khách hàng, ${products.length} món ăn và ${orders.length} đơn hàng.`);
    console.log('Tài khoản MD5 cũ không được chuyển. Hãy seed admin rồi cấp lại tài khoản trong trang quản trị.');
  } finally {
    await sql.end();
    await disconnectDatabase();
  }
}

migrate().catch((error) => {
  console.error('Chuyển dữ liệu thất bại:', error.message);
  process.exitCode = 1;
});
