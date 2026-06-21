const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(new ApiError(404, `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Đã xảy ra lỗi máy chủ.';
  let details = error.details;

  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0];
    statusCode = 409;
    message = `Dữ liệu ${duplicateField || ''} đã tồn tại.`.trim();
  }

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Dữ liệu gửi lên không hợp lệ.';
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Mã tài nguyên không hợp lệ.';
  }

  const response = { success: false, message };
  if (details) response.details = details;
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = { notFound, errorHandler };
