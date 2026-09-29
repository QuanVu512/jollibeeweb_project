const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const ExcelJS = require('exceljs');
const { startReportFixture } = require('../tools/reportFixture.cjs');
const service = require('../src/services/reportService');
const range = { from: '2026-09-01', to: '2026-09-03' };
let fixture;
let cookie;
before(async () => { fixture = await startReportFixture(); cookie = await fixture.login(); });
after(async () => { if (fixture) await fixture.stop(); });

test('revenue counts completed orders regardless of payment, with shipping/discount and Vietnam boundaries', async () => {
  const result = await service.summary(range);
  assert.equal(result.completedOrders, 27);
  assert.equal(result.totalRevenue, 26 * 105000 + 80000);
  assert.equal(result.averageOrderValue, result.totalRevenue / 27);
  assert.equal(result.series.length, 3);
  assert.equal(result.series[0].completedOrders, 1);
  assert.equal(result.series[1].completedOrders, 24);
  assert.equal(result.series[2].completedOrders, 2);
  assert.equal(result.series.reduce((sum, row) => sum + row.totalRevenue, 0), result.totalRevenue);
  assert.equal(result.topItem.name, 'Gà giòn');
  assert.equal(result.topItem.quantity, 53);
  assert.equal(result.comparison.totalRevenue, 105000);
  assert.deepEqual([result.comparison.from, result.comparison.to], ['2026-08-29', '2026-08-31']);
  const allTime = await service.summary({});
  assert.equal(allTime.completedOrders, 29);
  assert.equal(allTime.totalRevenue, 3020000);
  const indexes = await require('../src/models/Order').collection.indexes();
  assert.ok(indexes.some(index => index.key.status === 1 && index.key['payment.status'] === 1 && index.key.completedAt === -1));
});

test('weekly/monthly totals equal daily totals and drilldown includes all payment states', async () => {
  for (const groupBy of ['week', 'month']) {
    const result = await service.summary({ ...range, groupBy });
    assert.equal(result.series.length, 1);
    const orders = await service.transactions({ from: result.series[0].from, to: result.series[0].to, limit: 100 });
    assert.equal(orders.overview.totalRevenue, result.totalRevenue);
    assert.equal(orders.pagination.total, 27);
  }
});

test('transactions paginate and reconcile paid/unpaid/refunded without using orderedAt', async () => {
  const first = await service.transactions(range);
  assert.equal(first.items.length, 20);
  assert.equal(first.pagination.total, 27);
  assert.deepEqual(first.overview, { totalOrders: 27, paidOrders: 25, unpaidOrders: 1, refundedOrders: 1, totalRevenue: 2810000 });
  const second = await service.transactions({ ...range, page: 2 });
  assert.equal(second.items.length, 7);
  assert.ok(!second.items.some(row => first.items.some(other => String(other._id) === String(row._id))));
  for (const paymentStatus of ['paid', 'unpaid', 'refunded', 'unknown']) {
    const legacy = { ...range, paymentStatus };
    assert.deepEqual((await service.transactions(legacy)).overview, first.overview);
    assert.equal((await service.summary(legacy)).totalRevenue, 2810000);
    assert.equal((await service.customers(legacy)).overview.totalSpent, 2625000);
  }
  const search = await service.transactions({ ...range, search: '0900000000' });
  assert.equal(search.pagination.total, 4);
  const sorted = await service.transactions({ ...range, sortBy: 'total', sortDir: 'asc' });
  assert.equal(sorted.items[0].total, 80000);
});

test('customers group by id, not duplicate names, while keeping anonymous orders separate', async () => {
  const result = await service.customers(range);
  assert.equal(result.overview.customerCount, 22);
  assert.equal(result.overview.orders, 25);
  assert.equal(result.overview.totalSpent, 25 * 105000);
  assert.deepEqual(result.guest, { orders: 2, totalSpent: 185000, averageOrderValue: 92500 });
  assert.equal(result.items.length, 20); assert.equal(result.topCustomers.length, 5);
  assert.equal(result.items[0].orders, 4);
  const search = await service.customers({ ...range, search: 'Nguyễn Văn An' });
  assert.equal(search.overview.customerCount, 2);
  assert.equal(search.guest.orders, 2);
  assert.equal((await service.customers({ ...range, page: 2 })).items.length, 2);
  const guest = await service.transactions({ ...range, customerId: 'guest' });
  assert.equal(guest.pagination.total, 2); assert.equal(guest.overview.totalRevenue, 185000);
  const owned = await service.transactions({ ...range, customerId: String(fixture.customerIds[0]) });
  assert.equal(owned.pagination.total, 4); assert.equal(owned.overview.totalRevenue, 420000);
});

test('empty ranges have zero-filled series, no fake customer and no percentage against zero', async () => {
  const empty = { from: '2030-01-01', to: '2030-01-03' };
  const summary = await service.summary(empty);
  assert.equal(summary.totalRevenue, 0); assert.equal(summary.series.length, 3); assert.equal(summary.comparison.changePercent, null);
  assert.equal((await service.customers(empty)).overview.customerCount, 0);
  assert.equal((await service.transactions(empty)).pagination.total, 0);
});

async function workbook(type, extra = {}) {
  const result = await service.exportReport({ ...range, type, ...extra, limit: 1, page: 2 });
  const book = new ExcelJS.Workbook(); await book.xlsx.load(result.buffer); return book.worksheets[0];
}
test('revenue Excel equals UI series/totals and excludes cost/profit columns', async () => {
  const sheet = await workbook('revenue');
  assert.equal(sheet.rowCount, 5); assert.equal(sheet.getRow(5).getCell(4).value, 2810000);
  assert.equal(sheet.getRow(1).getCell(3).value, 'Số đơn hoàn thành');
  assert.equal(sheet.getRow(2).getCell(1).value, '2026-09-01');
  assert.equal(sheet.getRow(2).getCell(4).value, 105000);
  assert.equal(sheet.columnCount, 5);
});
test('customers Excel exports all pages, anonymous group and matching filtered totals', async () => {
  const sheet = await workbook('customers');
  assert.equal(sheet.rowCount, 25); assert.equal(sheet.getRow(24).getCell(1).value, 'KHÁCH LẺ');
  assert.equal(sheet.getRow(25).getCell(5).value, 2810000);
  const filtered = await workbook('customers', { search: 'Nguyễn Văn An' });
  assert.equal(filtered.rowCount, 5); assert.equal(filtered.getRow(5).getCell(5).value, 710000);
});
test('transaction Excel exports all pages, avoids repeated totals and ignores legacy payment filters', async () => {
  const sheet = await workbook('orders');
  assert.equal(sheet.rowCount, 30);
  assert.equal(sheet.getRow(30).getCell(1).value, 'TỔNG DOANH THU');
  assert.equal(sheet.getRow(30).getCell(18).value, 2810000);
  const rows = []; sheet.eachRow((row, index) => { if (index > 1 && index < 30) rows.push(row); });
  assert.equal(rows.reduce((sum, row) => sum + (typeof row.getCell(18).value === 'number' ? row.getCell(18).value : 0), 0), 2810000);
  const filtered = await workbook('orders', { paymentStatus: 'unpaid' });
  assert.equal(filtered.rowCount, 30); assert.equal(filtered.getRow(30).getCell(18).value, 2810000);
});
test('legacy item export remains available without cost/profit', async () => {
  const sheet = await workbook('items'); assert.equal(sheet.columnCount, 3); assert.equal(sheet.getRow(2).getCell(2).value, 53);
});

test('report APIs are admin-only and validate input; existing order detail remains readable', async () => {
  const cashierCookie = await fixture.login('reportcashier');
  for (const path of ['summary', 'transactions', 'customers', 'export?type=customers']) {
    assert.equal((await fetch(`${fixture.url}/api/v1/reports/${path}`)).status, 401);
    assert.equal((await fetch(`${fixture.url}/api/v1/reports/${path}`, { headers: { cookie: cashierCookie } })).status, 403);
  }
  for (const path of ['summary?from=2026-02-30', 'summary?groupBy=year', 'transactions?customerId=abc', 'customers?sortBy=passwordHash', 'export?type=wrong']) {
    assert.equal((await fetch(`${fixture.url}/api/v1/reports/${path}`, { headers: { cookie } })).status, 400);
  }
  const response = await fetch(`${fixture.url}/api/v1/reports/summary?from=2026-09-01&to=2026-09-03`, { headers: { cookie } });
  assert.equal(response.status, 200); assert.equal((await response.json()).data.totalRevenue, 2810000);
  const legacy = await fetch(`${fixture.url}/api/v1/reports/transactions?from=2026-09-01&to=2026-09-03&paymentStatus=wrong`, { headers: { cookie } });
  assert.equal(legacy.status, 200); assert.equal((await legacy.json()).data.overview.totalRevenue, 2810000);
  const detail = await fetch(`${fixture.url}/api/v1/banhang/orders/${fixture.rows[0]._id}`, { headers: { cookie } });
  assert.equal(detail.status, 200); assert.equal((await detail.json()).data.order.customer.fullName, 'Nguyễn Văn An');
  const unchanged = await require('../src/models/Order').findById(fixture.rows.find(row => row.payment.status === 'unpaid')._id).lean();
  assert.equal(unchanged.payment.status, 'unpaid');
});
