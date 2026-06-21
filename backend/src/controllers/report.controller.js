const ExcelJS = require('exceljs');
const Order = require('../models/Order');
const { ORDER_STATUS } = require('../constants/orderStatus');
const ApiError = require('../utils/ApiError');

function reportFilter(query) {
  const filter = {
    status: ORDER_STATUS.COMPLETED,
    'payment.status': { $ne: 'refunded' }
  };
  const completedAt = {};

  if (query.from) {
    const from = new Date(`${query.from}T00:00:00`);
    if (Number.isNaN(from.getTime())) throw new ApiError(400, 'Ngày bắt đầu không hợp lệ.');
    completedAt.$gte = from;
  }
  if (query.to) {
    const to = new Date(`${query.to}T23:59:59.999`);
    if (Number.isNaN(to.getTime())) throw new ApiError(400, 'Ngày kết thúc không hợp lệ.');
    completedAt.$lte = to;
  }
  if (completedAt.$gte && completedAt.$lte && completedAt.$gte > completedAt.$lte) {
    throw new ApiError(400, 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
  }
  if (Object.keys(completedAt).length) filter.completedAt = completedAt;
  return filter;
}

async function summary(req, res) {
  const filter = reportFilter(req.query);
  const [overviewRows, topItemRows] = await Promise.all([
    Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          completedOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
          totalCost: {
            $sum: {
              $sum: {
                $map: {
                  input: '$items',
                  as: 'item',
                  in: { $multiply: ['$$item.quantity', { $ifNull: ['$$item.costPrice', 0] }] }
                }
              }
            }
          }
        }
      },
      { $addFields: { grossProfit: { $subtract: ['$totalRevenue', '$totalCost'] } } }
    ]),
    Order.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
          cost: { $sum: { $multiply: ['$items.quantity', { $ifNull: ['$items.costPrice', 0] }] } }
        }
      },
      { $sort: { quantity: -1, revenue: -1 } },
      { $limit: 1 }
    ])
  ]);

  const overview = overviewRows[0] || {
    totalRevenue: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    totalCost: 0,
    grossProfit: 0
  };
  const topItem = topItemRows[0]
    ? {
        name: topItemRows[0]._id,
        quantity: topItemRows[0].quantity,
        revenue: topItemRows[0].revenue,
        cost: topItemRows[0].cost,
        grossProfit: topItemRows[0].revenue - topItemRows[0].cost
      }
    : null;

  res.json({ success: true, data: { ...overview, topItem } });
}

function styleWorksheet(worksheet) {
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE21B22' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 24;
  worksheet.autoFilter = { from: 'A1', to: worksheet.getRow(1).getCell(worksheet.columnCount).address };
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: true }, (cell) => {
      maxLength = Math.max(maxLength, String(cell.value ?? '').length + 2);
    });
    column.width = Math.min(maxLength, 45);
  });
}

function styleTotalRow(row) {
  row.font = { bold: true };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F3F5' } };
}

async function exportReport(req, res) {
  const type = req.query.type || 'orders';
  if (!['orders', 'revenue', 'items'].includes(type)) {
    throw new ApiError(400, 'Loại báo cáo không hợp lệ.');
  }

  const filter = reportFilter(req.query);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Jollibee Admin';
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet('Bao cao');

  if (type === 'items') {
    worksheet.columns = [
      { header: 'Tên món ăn', key: 'name' },
      { header: 'Tổng số lượng bán', key: 'quantity' },
      { header: 'Doanh thu món (VNĐ)', key: 'revenue' },
      { header: 'Giá vốn (VNĐ)', key: 'cost' },
      { header: 'Lợi nhuận gộp (VNĐ)', key: 'grossProfit' }
    ];
    const items = await Order.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
          cost: { $sum: { $multiply: ['$items.quantity', { $ifNull: ['$items.costPrice', 0] }] } }
        }
      },
      { $sort: { quantity: -1 } }
    ]);
    items.forEach((item) => worksheet.addRow({
      name: item._id,
      quantity: item.quantity,
      revenue: item.revenue,
      cost: item.cost,
      grossProfit: item.revenue - item.cost
    }));
    const totalRow = worksheet.addRow({
      name: 'TỔNG CỘNG',
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      revenue: items.reduce((sum, item) => sum + item.revenue, 0),
      cost: items.reduce((sum, item) => sum + item.cost, 0),
      grossProfit: items.reduce((sum, item) => sum + item.revenue - item.cost, 0)
    });
    styleTotalRow(totalRow);
    worksheet.getColumn('revenue').numFmt = '#,##0';
    worksheet.getColumn('cost').numFmt = '#,##0';
    worksheet.getColumn('grossProfit').numFmt = '#,##0';
  } else {
    worksheet.columns = type === 'revenue'
      ? [
          { header: 'Mã đơn', key: 'orderCode' },
          { header: 'Khách hàng', key: 'customerName' },
          { header: 'Ngày đặt', key: 'orderedAt' },
          { header: 'Doanh thu (VNĐ)', key: 'total' }
        ]
      : [
          { header: 'Mã đơn', key: 'orderCode' },
          { header: 'Khách hàng', key: 'customerName' },
          { header: 'Ngày đặt', key: 'orderedAt' },
          { header: 'Địa chỉ giao', key: 'deliveryAddress' }
        ];
    const orders = await Order.find(filter).sort({ orderedAt: -1 }).lean();
    orders.forEach((order) => worksheet.addRow(order));
    const totalRow = type === 'revenue'
      ? worksheet.addRow({ orderCode: 'TỔNG DOANH THU', total: orders.reduce((sum, order) => sum + order.total, 0) })
      : worksheet.addRow({ orderCode: 'TỔNG SỐ ĐƠN', deliveryAddress: `${orders.length} đơn` });
    styleTotalRow(totalRow);
    worksheet.getColumn('orderedAt').numFmt = 'dd/mm/yyyy hh:mm';
    if (type === 'revenue') worksheet.getColumn('total').numFmt = '#,##0';
  }

  styleWorksheet(worksheet);
  const fileName = `bao-cao-${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(Buffer.from(buffer));
}

module.exports = { summary, exportReport };
