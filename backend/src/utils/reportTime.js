const ApiError = require('./ApiError');
const DAY = 86400000;
const OFFSET = 7 * 3600000;

function localDate(value = new Date()) {
  return new Date(new Date(value).getTime() + OFFSET).toISOString().slice(0, 10);
}

function validateDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, 'Ngày phải có định dạng YYYY-MM-DD.');
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new ApiError(400, 'Ngày không hợp lệ.');
  }
  return value;
}

function addDays(value, days) {
  return new Date(new Date(`${value}T00:00:00Z`).getTime() + days * DAY).toISOString().slice(0, 10);
}

function startOfDay(value) { return new Date(`${value}T00:00:00+07:00`); }

function validateQuery(query) {
  // Ignore legacy paymentStatus parameters; reports count all completed orders.
  for (const key of ['from', 'to', 'groupBy', 'search', 'customerId', 'type', 'sortBy', 'sortDir']) {
    if (query[key] !== undefined && typeof query[key] !== 'string') throw new ApiError(400, 'Bộ lọc không hợp lệ.');
  }
  if (query.from) validateDate(query.from);
  if (query.to) validateDate(query.to);
  if (query.from && query.to && query.from > query.to) throw new ApiError(400, 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
  if (query.groupBy && !['day', 'week', 'month'].includes(query.groupBy)) throw new ApiError(400, 'Cách nhóm thời gian không hợp lệ.');
  if (query.sortDir && !['asc', 'desc'].includes(query.sortDir)) throw new ApiError(400, 'Chiều sắp xếp không hợp lệ.');
}

function periodStart(value, groupBy) {
  const date = new Date(`${value}T00:00:00Z`);
  if (groupBy === 'month') date.setUTCDate(1);
  if (groupBy === 'week') date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}

function nextPeriod(value, groupBy) {
  if (groupBy === 'month') {
    const date = new Date(`${value}T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + 1);
    return date.toISOString().slice(0, 10);
  }
  return addDays(value, groupBy === 'week' ? 7 : 1);
}

function buildSeries(daily, from, to, groupBy) {
  const totals = new Map();
  for (const row of daily) {
    const key = periodStart(row._id, groupBy);
    const current = totals.get(key) || { totalRevenue: 0, completedOrders: 0 };
    current.totalRevenue += row.totalRevenue;
    current.completedOrders += row.completedOrders;
    totals.set(key, current);
  }
  const series = [];
  for (let key = periodStart(from, groupBy); key <= to; key = nextPeriod(key, groupBy)) {
    const values = totals.get(key) || { totalRevenue: 0, completedOrders: 0 };
    series.push({ period: key, from: key < from ? from : key,
      to: addDays(nextPeriod(key, groupBy), -1) > to ? to : addDays(nextPeriod(key, groupBy), -1),
      ...values, averageOrderValue: values.completedOrders ? values.totalRevenue / values.completedOrders : 0 });
  }
  return series;
}

module.exports = { DAY, localDate, validateDate, addDays, startOfDay, validateQuery, buildSeries };
