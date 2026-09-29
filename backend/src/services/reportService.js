const ExcelJS = require('exceljs');
const mongoose = require('mongoose');
const orderRepository = require('../repositories/order.repository');
const { ORDER_STATUS } = require('../constants/orderStatus');
const ApiError = require('../utils/ApiError');
const { escapeRegex } = require('../utils/text');
const { pagination, paginationResult } = require('../utils/adminQuery');
const { DAY, localDate, addDays, startOfDay, validateQuery, buildSeries } = require('../utils/reportTime');

function reportFilter(query) {
  validateQuery(query);
  const filter = { status: ORDER_STATUS.COMPLETED, completedAt: { $type: 'date' } };
  // Payment is informational while the payment workflow is being completed.
  if (query.from) filter.completedAt.$gte = startOfDay(query.from);
  if (query.to) filter.completedAt.$lt = startOfDay(addDays(query.to, 1));
  if (query.customerId) {
    if (query.customerId === 'guest') filter.customer = null;
    else {
      if (!/^[a-f\d]{24}$/i.test(query.customerId)) throw new ApiError(400, 'Mã khách hàng không hợp lệ.');
      filter.customer = new mongoose.Types.ObjectId(query.customerId);
    }
  }
  return filter;
}

const overviewGroup = {
  _id: null, totalRevenue: { $sum: '$total' }, completedOrders: { $sum: 1 }, averageOrderValue: { $avg: '$total' },
  // Retained for existing API consumers; cost/profit are not presented in reports.
  totalCost: { $sum: { $sum: { $map: { input: '$items', as: 'item',
    in: { $multiply: ['$$item.quantity', { $ifNull: ['$$item.costPrice', 0] }] } } } } }
};

function itemPipeline(limit) {
  return [{ $unwind: '$items' }, { $group: {
    _id: '$items.name', quantity: { $sum: '$items.quantity' },
    revenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
    cost: { $sum: { $multiply: ['$items.quantity', { $ifNull: ['$items.costPrice', 0] }] } }
  } }, { $sort: { quantity: -1, revenue: -1, _id: 1 } }, ...(limit ? [{ $limit: limit }] : [])];
}

async function summary(query) {
  const filter = reportFilter(query);
  const [data] = await orderRepository.aggregate([{ $match: filter }, { $facet: {
    overview: [{ $group: overviewGroup }], topItems: itemPipeline(5),
    daily: [{ $group: {
      _id: { $dateToString: { date: '$completedAt', format: '%Y-%m-%d', timezone: '+07:00' } },
      totalRevenue: { $sum: '$total' }, completedOrders: { $sum: 1 }
    } }, { $sort: { _id: 1 } }]
  } }]);
  const overview = data.overview[0] || { totalRevenue: 0, completedOrders: 0, averageOrderValue: 0, totalCost: 0 };
  const topItems = data.topItems.map(row => ({ name: row._id, quantity: row.quantity, revenue: row.revenue,
    cost: row.cost, grossProfit: row.revenue - row.cost }));
  // No date arguments preserves the existing all-time API, bounded by available data.
  const from = query.from || data.daily[0]?._id || query.to || localDate();
  const to = query.to || data.daily.at(-1)?._id || (from > localDate() ? from : localDate());
  const groupBy = query.groupBy || 'day';
  const days = Math.round((startOfDay(to) - startOfDay(from)) / DAY) + 1;
  const previousFrom = addDays(from, -days);
  const previousTo = addDays(from, -1);
  const previous = await orderRepository.aggregate([{ $match: reportFilter({ ...query, from: previousFrom, to: previousTo }) },
    { $group: { _id: null, totalRevenue: { $sum: '$total' } } }]);
  const previousRevenue = previous[0]?.totalRevenue || 0;
  return { ...overview, grossProfit: overview.totalRevenue - overview.totalCost,
    topItem: topItems[0] || null, topItems, range: { from, to, groupBy },
    series: buildSeries(data.daily, from, to, groupBy),
    comparison: { from: previousFrom, to: previousTo, totalRevenue: previousRevenue,
      changePercent: previousRevenue ? (overview.totalRevenue - previousRevenue) / previousRevenue * 100 : null } };
}

const customerLookup = [
  { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'profile' } },
  { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
  { $addFields: { customerName: { $ifNull: ['$profile.fullName', '$customerName'] },
    customerPhone: { $ifNull: ['$profile.phone', '$customerPhone'] }, customerCode: { $ifNull: ['$profile.customerCode', ''] },
    customerEmail: { $ifNull: ['$profile.email', ''] } } }
];

function transactionPipeline(query) {
  const pipeline = [{ $match: reportFilter(query) }, ...customerLookup];
  if (query.search?.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), 'i');
    pipeline.push({ $match: { $or: [{ orderCode: regex }, { customerName: regex }, { customerPhone: regex }] } });
  }
  return pipeline;
}

const transactionProjection = { orderCode: 1, orderedAt: 1, completedAt: 1, customer: 1, customerCode: 1,
  customerName: 1, customerPhone: 1, orderType: 1, tableNumber: 1, payment: 1, total: 1 };
const transactionOverview = { _id: null, totalOrders: { $sum: 1 },
  paidOrders: { $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, 1, 0] } },
  unpaidOrders: { $sum: { $cond: [{ $eq: ['$payment.status', 'unpaid'] }, 1, 0] } },
  refundedOrders: { $sum: { $cond: [{ $eq: ['$payment.status', 'refunded'] }, 1, 0] } },
  totalRevenue: { $sum: '$total' } };

function reportSort(query, kind) {
  const allowed = kind === 'orders' ? ['completedAt', 'total', 'orderCode', 'customerName'] : ['totalSpent', 'orders', 'lastCompletedAt', 'fullName'];
  const key = query.sortBy || allowed[0];
  if (!allowed.includes(key)) throw new ApiError(400, 'Cột sắp xếp không hợp lệ.');
  return { [key]: query.sortDir === 'asc' ? 1 : -1, _id: 1 };
}

async function transactions(query) {
  const { page, limit, skip } = pagination(query);
  const [data] = await orderRepository.aggregate([...transactionPipeline(query), { $facet: {
    overview: [{ $group: transactionOverview }],
    items: [{ $sort: reportSort(query, 'orders') }, { $skip: skip }, { $limit: limit }, { $project: transactionProjection }]
  } }]);
  const overview = data.overview[0] || { totalOrders: 0, paidOrders: 0, unpaidOrders: 0, refundedOrders: 0, totalRevenue: 0 };
  delete overview._id;
  return { items: data.items, overview, pagination: paginationResult(page, limit, overview.totalOrders) };
}

function customerPipeline(query) {
  return [{ $match: reportFilter(query) }, { $group: {
    _id: { $ifNull: ['$customer', null] }, orders: { $sum: 1 }, totalSpent: { $sum: '$total' },
    lastCompletedAt: { $max: '$completedAt' }, snapshotName: { $first: '$customerName' }, snapshotPhone: { $first: '$customerPhone' }
  } }, { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'profile' } },
  { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
  { $project: { orders: 1, totalSpent: 1, lastCompletedAt: 1, averageOrderValue: { $divide: ['$totalSpent', '$orders'] },
    customerCode: { $ifNull: ['$profile.customerCode', ''] },
    fullName: { $ifNull: ['$profile.fullName', { $ifNull: ['$snapshotName', 'Hồ sơ không còn tồn tại'] }] },
    phone: { $ifNull: ['$profile.phone', { $ifNull: ['$snapshotPhone', ''] }] } } }];
}

function knownCustomerFilter(query) {
  const filter = { _id: { $ne: null } };
  if (query.search?.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), 'i');
    filter.$or = [{ customerCode: regex }, { fullName: regex }, { phone: regex }];
  }
  return { $match: filter };
}

async function customers(query) {
  const { page, limit, skip } = pagination(query);
  const known = knownCustomerFilter(query);
  const sort = { $sort: reportSort(query, 'customers') };
  const [data] = await orderRepository.aggregate([...customerPipeline(query), { $facet: {
    overview: [known, { $group: { _id: null, customerCount: { $sum: 1 }, totalSpent: { $sum: '$totalSpent' }, orders: { $sum: '$orders' } } }],
    guest: [{ $match: { _id: null } }], topCustomers: [known, { $sort: { totalSpent: -1, _id: 1 } }, { $limit: 5 }],
    items: [known, sort, { $skip: skip }, { $limit: limit }]
  } }]);
  const overview = data.overview[0] || { customerCount: 0, totalSpent: 0, orders: 0 };
  delete overview._id;
  const guest = data.guest[0] || { orders: 0, totalSpent: 0, averageOrderValue: 0 };
  return { overview, guest: { orders: guest.orders, totalSpent: guest.totalSpent, averageOrderValue: guest.averageOrderValue },
    topCustomers: data.topCustomers, items: data.items, pagination: paginationResult(page, limit, overview.customerCount) };
}

function styleWorksheet(sheet) {
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE21B22' } };
  sheet.getRow(1).height = 24;
  sheet.autoFilter = { from: 'A1', to: sheet.getRow(1).getCell(sheet.columnCount).address };
  sheet.columns.forEach(column => {
    let length = 12;
    column.eachCell({ includeEmpty: true }, cell => { length = Math.max(length, String(cell.value ?? '').length + 2); });
    column.width = Math.min(length, 45);
    if (['total', 'totalRevenue', 'averageOrderValue', 'totalSpent', 'revenue', 'shippingFee', 'discount', 'itemUnitPrice'].includes(column.key)) column.numFmt = '#,##0';
  });
}

function totalRow(sheet, values) {
  const row = sheet.addRow(values);
  row.font = { bold: true };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F3F5' } };
}

const paymentLabels = { paid: 'Đã thanh toán', unpaid: 'Chưa thanh toán', refunded: 'Hoàn tiền' };
const methodLabels = { cash: 'Tiền mặt', card: 'Thẻ', e_wallet: 'Ví điện tử', cod: 'COD' };
const typeLabels = { dine_in: 'Tại bàn', pickup: 'Mang đi', delivery: 'Giao hàng' };
function dateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short', hourCycle: 'h23' }).format(new Date(value));
}

function exportOrderType(order) {
  if (order.orderType !== 'dine_in') return typeLabels[order.orderType] || order.orderType;
  const table = String(order.tableNumber || (/^bàn\s+/i.test(order.deliveryAddress || '') ? order.deliveryAddress : '')).replace(/^bàn\s*/i, '').trim();
  return `dinein(${table || 'chưa xác định'})`;
}

async function exportReport(query) {
  const type = query.type || 'orders';
  if (!['orders', 'revenue', 'items', 'customers'].includes(type)) throw new ApiError(400, 'Loại báo cáo không hợp lệ.');
  validateQuery(query);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Jollibee Admin';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Bao cao');
  if (type === 'revenue') {
    const data = await summary(query);
    sheet.columns = [{ header: 'Từ ngày', key: 'from' }, { header: 'Đến ngày', key: 'to' },
      { header: 'Số đơn hoàn thành', key: 'completedOrders' }, { header: 'Doanh thu (VNĐ)', key: 'totalRevenue' },
      { header: 'Giá trị đơn trung bình (VNĐ)', key: 'averageOrderValue' }];
    data.series.forEach(row => sheet.addRow(row));
    totalRow(sheet, { from: 'TỔNG CỘNG', completedOrders: data.completedOrders, totalRevenue: data.totalRevenue, averageOrderValue: data.averageOrderValue });
  } else if (type === 'customers') {
    const rows = await orderRepository.aggregate([...customerPipeline(query), knownCustomerFilter(query), { $sort: reportSort(query, 'customers') }]);
    const { guest } = await customers(query);
    sheet.columns = [{ header: 'Mã khách', key: 'customerCode' }, { header: 'Họ tên', key: 'fullName' },
      { header: 'Số điện thoại', key: 'phone' }, { header: 'Số đơn', key: 'orders' }, { header: 'Tổng chi tiêu (VNĐ)', key: 'totalSpent' },
      { header: 'Đơn trung bình (VNĐ)', key: 'averageOrderValue' }, { header: 'Hoàn thành gần nhất', key: 'lastCompletedAt' }];
    rows.forEach(row => sheet.addRow({ ...row, lastCompletedAt: dateTime(row.lastCompletedAt) }));
    sheet.addRow({ customerCode: 'KHÁCH LẺ', fullName: 'Đơn không liên kết hồ sơ khách hàng', ...guest });
    const orders = rows.reduce((sum, row) => sum + row.orders, guest.orders);
    const totalSpent = rows.reduce((sum, row) => sum + row.totalSpent, guest.totalSpent);
    totalRow(sheet, { customerCode: 'TỔNG CỘNG', orders, totalSpent, averageOrderValue: orders ? totalSpent / orders : 0 });
  } else if (type === 'items') {
    const rows = await orderRepository.aggregate([{ $match: reportFilter(query) }, ...itemPipeline()]);
    sheet.columns = [{ header: 'Tên món', key: 'name' }, { header: 'Số lượng bán', key: 'quantity' },
      { header: 'Tiền món trước giảm giá, chưa gồm giao hàng (VNĐ)', key: 'revenue' }];
    rows.forEach(row => sheet.addRow({ name: row._id, quantity: row.quantity, revenue: row.revenue }));
    totalRow(sheet, { name: 'TỔNG CỘNG', quantity: rows.reduce((sum, row) => sum + row.quantity, 0), revenue: rows.reduce((sum, row) => sum + row.revenue, 0) });
  } else {
    const rows = await orderRepository.aggregate([...transactionPipeline(query), { $sort: reportSort(query, 'orders') }]);
    sheet.columns = [{ header: 'Mã đơn', key: 'orderCode' }, { header: 'Ngày đặt', key: 'orderedAt' },
      { header: 'Ngày hoàn thành', key: 'completedAt' }, { header: 'Trạng thái đơn', key: 'status' },
      { header: 'Loại đơn', key: 'orderType' }, { header: 'Mã khách', key: 'customerCode' },
      { header: 'Khách hàng', key: 'customerName' }, { header: 'Số điện thoại', key: 'customerPhone' },
      { header: 'Email', key: 'customerEmail' },
      { header: 'Địa chỉ giao', key: 'deliveryAddress' }, { header: 'Phương thức thanh toán', key: 'paymentMethod' },
      { header: 'Trạng thái thanh toán', key: 'paymentStatus' }, { header: 'Tên món', key: 'itemName' },
      { header: 'Số lượng', key: 'itemQuantity' }, { header: 'Đơn giá (VNĐ)', key: 'itemUnitPrice' },
      { header: 'Phí giao hàng (VNĐ)', key: 'shippingFee' }, { header: 'Giảm giá (VNĐ)', key: 'discount' },
      { header: 'Tổng thanh toán (VNĐ)', key: 'total' }];
    rows.forEach(order => (order.items?.length ? order.items : [null]).forEach((item, index) => sheet.addRow({
      ...order, orderedAt: dateTime(order.orderedAt), completedAt: dateTime(order.completedAt), status: 'Hoàn thành',
      orderType: exportOrderType(order), paymentMethod: methodLabels[order.payment?.method] || '',
      paymentStatus: paymentLabels[order.payment?.status] || '', itemName: item?.name || '', itemQuantity: item?.quantity ?? '',
      itemUnitPrice: item?.unitPrice ?? '', shippingFee: index === 0 ? order.shippingFee : '',
      discount: index === 0 ? order.discount : '', total: index === 0 ? order.total : ''
    })));
    totalRow(sheet, { orderCode: 'TỔNG DOANH THU', total: rows.reduce((sum, row) => sum + row.total, 0) });
  }
  styleWorksheet(sheet);
  return { fileName: `bao-cao-${type}-${query.from || 'tat-ca'}-${query.to || localDate()}.xlsx`, buffer: await workbook.xlsx.writeBuffer() };
}

module.exports = { summary, transactions, customers, exportReport };
