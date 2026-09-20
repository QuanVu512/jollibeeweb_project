const ApiError = require('./ApiError');

function pagination(query, defaults = {}) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const defaultLimit = defaults.defaultLimit || 20;
  const maxLimit = defaults.maxLimit || 100;
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
}

function dateRange(query, field = 'createdAt') {
  const range = {};
  if (query.from) {
    const from = new Date(`${query.from}T00:00:00`);
    if (Number.isNaN(from.getTime())) throw new ApiError(400, 'Ngày bắt đầu không hợp lệ.');
    range.$gte = from;
  }
  if (query.to) {
    const to = new Date(`${query.to}T23:59:59.999`);
    if (Number.isNaN(to.getTime())) throw new ApiError(400, 'Ngày kết thúc không hợp lệ.');
    range.$lte = to;
  }
  if (range.$gte && range.$lte && range.$gte > range.$lte) {
    throw new ApiError(400, 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
  }
  return Object.keys(range).length ? { [field]: range } : {};
}

function paginationResult(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

module.exports = { pagination, dateRange, paginationResult };
