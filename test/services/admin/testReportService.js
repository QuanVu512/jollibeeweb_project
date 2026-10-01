const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Resolve path to backend modules
const candidate1 = path.resolve(__dirname, '../../../backend');
const candidate2 = path.resolve(__dirname, '../../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;

const orderRepository = require(path.join(backendRoot, 'src/repositories/order.repository'));
const ApiError = require(path.join(backendRoot, 'src/utils/ApiError'));

// Import target unit: reportService
const reportService = require(path.join(backendRoot, 'src/services/reportService'));

// -------------------------------------------------------------
// 1. summary(query)
// -------------------------------------------------------------

test('UT_REP_01: summary(query) - Thống kê doanh thu và đơn hàng thành công', async () => {
  orderRepository.aggregate = async (pipeline) => {
    // Check if it's the main summary aggregation or comparison
    if (pipeline.some((stage) => stage.$facet)) {
      return [
        {
          overview: [{ totalRevenue: 1500000, completedOrders: 10, averageOrderValue: 150000, totalCost: 800000 }],
          topItems: [{ _id: 'Gà Giòn Cay', quantity: 25, revenue: 1125000, cost: 600000 }],
          daily: [{ _id: '2026-09-01', totalRevenue: 1500000, completedOrders: 10 }]
        }
      ];
    }
    // comparison query
    return [{ totalRevenue: 1000000 }];
  };

  const result = await reportService.summary({ from: '2026-09-01', to: '2026-09-01' });
  assert.equal(result.totalRevenue, 1500000);
  assert.equal(result.completedOrders, 10);
  assert.equal(result.averageOrderValue, 150000);
  assert.equal(result.topItems[0].name, 'Gà Giòn Cay');
  assert.equal(result.comparison.totalRevenue, 1000000);
  assert.equal(result.comparison.changePercent, 50); // (1500000 - 1000000) / 1000000 * 100 = 50%
});

test('UT_REP_02: summary(query) - Ném lỗi khi định dạng ngày from không đúng', async () => {
  await assert.rejects(
    async () => {
      await reportService.summary({ from: 'invalid-date' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      return true;
    }
  );
});

test('UT_REP_03: summary(query) - Ném lỗi khi mã khách hàng lọc không đúng định dạng', async () => {
  await assert.rejects(
    async () => {
      await reportService.summary({ customerId: 'invalid-cust-id' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Mã khách hàng không hợp lệ/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 2. transactions(query)
// -------------------------------------------------------------

test('UT_REP_04: transactions(query) - Lấy danh sách giao dịch đơn hoàn thành với phân trang', async () => {
  orderRepository.aggregate = async () => [
    {
      overview: [{ totalOrders: 2, paidOrders: 2, unpaidOrders: 0, refundedOrders: 0, totalRevenue: 300000 }],
      items: [
        {
          orderCode: 'DH0001',
          total: 150000,
          customerName: 'Nguyễn Văn A',
          payment: { status: 'paid', method: 'cash' }
        }
      ]
    }
  ];

  const result = await reportService.transactions({ page: '1', limit: '10' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].orderCode, 'DH0001');
  assert.equal(result.overview.totalOrders, 2);
  assert.equal(result.overview.totalRevenue, 300000);
  assert.equal(result.pagination.total, 2);
});

test('UT_REP_05: transactions(query) - Ném lỗi khi cột sắp xếp sortBy không hợp lệ', async () => {
  await assert.rejects(
    async () => {
      await reportService.transactions({ sortBy: 'unsupported_column' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Cột sắp xếp không hợp lệ/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 3. customers(query)
// -------------------------------------------------------------

test('UT_REP_06: customers(query) - Tổng hợp hành vi mua sắm của khách hàng', async () => {
  orderRepository.aggregate = async () => [
    {
      overview: [{ customerCount: 1, totalSpent: 500000, orders: 3 }],
      guest: [{ orders: 1, totalSpent: 100000, averageOrderValue: 100000 }],
      topCustomers: [{ fullName: 'Trần Thị B', totalSpent: 500000, orders: 3 }],
      items: [{ customerCode: 'KH0001', fullName: 'Trần Thị B', totalSpent: 500000, orders: 3 }]
    }
  ];

  const result = await reportService.customers({ page: '1', limit: '10' });
  assert.equal(result.overview.customerCount, 1);
  assert.equal(result.overview.totalSpent, 500000);
  assert.equal(result.guest.orders, 1);
  assert.equal(result.topCustomers[0].fullName, 'Trần Thị B');
});

// -------------------------------------------------------------
// 4. exportReport(query)
// -------------------------------------------------------------

test('UT_REP_07: exportReport(query) - Xuất file Excel báo cáo doanh thu thành công', async () => {
  orderRepository.aggregate = async (pipeline) => {
    if (pipeline.some((stage) => stage.$facet)) {
      return [
        {
          overview: [{ totalRevenue: 100000, completedOrders: 1, averageOrderValue: 100000, totalCost: 50000 }],
          topItems: [],
          daily: [{ _id: '2026-09-01', totalRevenue: 100000, completedOrders: 1 }]
        }
      ];
    }
    return [{ totalRevenue: 0 }];
  };

  const result = await reportService.exportReport({ type: 'revenue', from: '2026-09-01', to: '2026-09-01' });
  assert.ok(result.fileName.includes('bao-cao-revenue-2026-09-01-2026-09-01.xlsx'));
  assert.ok(result.buffer instanceof Uint8Array || Buffer.isBuffer(result.buffer));
});

test('UT_REP_08: exportReport(query) - Xuất file Excel báo cáo đơn hàng (orders) thành công', async () => {
  orderRepository.aggregate = async () => [
    {
      orderCode: 'DH0001',
      orderedAt: new Date('2026-09-01T10:00:00Z'),
      completedAt: new Date('2026-09-01T10:30:00Z'),
      orderType: 'pickup',
      customerName: 'Khách Test',
      customerPhone: '0912345678',
      total: 80000,
      payment: { method: 'cash', status: 'paid' },
      items: [{ name: 'Gà rán', quantity: 2, unitPrice: 40000 }]
    }
  ];

  const result = await reportService.exportReport({ type: 'orders', from: '2026-09-01', to: '2026-09-01' });
  assert.ok(result.fileName.includes('bao-cao-orders'));
  assert.ok(result.buffer);
});

test('UT_REP_09: exportReport(query) - Xuất file Excel báo cáo món ăn (items) thành công', async () => {
  orderRepository.aggregate = async () => [
    {
      _id: 'Gà Giòn Vui Vẻ',
      quantity: 50,
      revenue: 2000000
    }
  ];

  const result = await reportService.exportReport({ type: 'items', from: '2026-09-01', to: '2026-09-01' });
  assert.ok(result.fileName.includes('bao-cao-items'));
  assert.ok(result.buffer);
});

test('UT_REP_10: exportReport(query) - Ném lỗi khi loại báo cáo không hợp lệ', async () => {
  await assert.rejects(
    async () => {
      await reportService.exportReport({ type: 'unknown_type' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Loại báo cáo không hợp lệ/);
      return true;
    }
  );
});
