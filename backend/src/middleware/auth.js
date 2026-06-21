const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, _res, next) => {
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies[config.cookieName] || bearerToken;

  if (!token) {
    throw new ApiError(401, 'Bạn cần đăng nhập để tiếp tục.');
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, {
      issuer: 'jollibee-admin-api',
      audience: 'jollibee-admin'
    });
  } catch (_error) {
    throw new ApiError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
  }

  const user = await User.findById(payload.sub)
    .select('+tokenVersion username role displayName isActive employee revokedAt');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Tài khoản không tồn tại hoặc đã bị khóa.');
  }
  if (payload.version !== (user.tokenVersion || 0)) {
    throw new ApiError(401, 'Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại.');
  }

  req.user = user;
  next();
});

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Bạn không có quyền thực hiện thao tác này.'));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
