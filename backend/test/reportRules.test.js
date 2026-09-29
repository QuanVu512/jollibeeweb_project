const test = require('node:test');
const assert = require('node:assert/strict');
const { validateDate, validateQuery, startOfDay, buildSeries, localDate } = require('../src/utils/reportTime');

test('report dates reject impossible dates, wrong shape and reversed ranges', () => {
  for (const value of ['2026-02-29', '2026-04-31', '2026-2-01', 'invalid']) assert.throws(() => validateDate(value));
  assert.equal(validateDate('2024-02-29'), '2024-02-29');
  assert.throws(() => validateQuery({ from: '2026-09-05', to: '2026-09-01' }));
  assert.throws(() => validateQuery({ from: ['2026-09-01'] }));
  assert.throws(() => validateQuery({ groupBy: 'year' }));
  assert.doesNotThrow(() => validateQuery({ paymentStatus: 'unknown' }));
});

test('report day boundaries use Vietnam time independently of host timezone', () => {
  assert.equal(startOfDay('2026-09-01').toISOString(), '2026-08-31T17:00:00.000Z');
  assert.equal(localDate('2026-09-01T17:00:00Z'), '2026-09-02');
});

test('daily series fills zero days and computes weighted averages', () => {
  const rows = buildSeries([{ _id: '2026-09-02', totalRevenue: 300, completedOrders: 2 }], '2026-09-01', '2026-09-03', 'day');
  assert.deepEqual(rows.map(row => row.totalRevenue), [0, 300, 0]);
  assert.equal(rows[1].averageOrderValue, 150);
});

test('weekly series starts Monday and clips first and last buckets to selected dates', () => {
  const rows = buildSeries([{ _id: '2026-09-02', totalRevenue: 300, completedOrders: 2 }, { _id: '2026-09-08', totalRevenue: 100, completedOrders: 1 }], '2026-09-02', '2026-09-08', 'week');
  assert.deepEqual(rows.map(row => [row.period, row.from, row.to]), [['2026-08-31', '2026-09-02', '2026-09-06'], ['2026-09-07', '2026-09-07', '2026-09-08']]);
  assert.deepEqual(rows.map(row => row.totalRevenue), [300, 100]);
});

test('monthly series crosses year boundaries and keeps months without orders', () => {
  const rows = buildSeries([{ _id: '2026-12-30', totalRevenue: 500, completedOrders: 2 }], '2026-12-15', '2027-02-03', 'month');
  assert.deepEqual(rows.map(row => [row.from, row.to, row.totalRevenue]), [['2026-12-15', '2026-12-31', 500], ['2027-01-01', '2027-01-31', 0], ['2027-02-01', '2027-02-03', 0]]);
});
