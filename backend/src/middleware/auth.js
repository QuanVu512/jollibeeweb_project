const { config } = require('../config/env');
const authService = require('../services/authService');
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

  req.user = await authService.authenticateToken(token);
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

async function resolveUserForLogout(req, _res, next) {
  const token = req.cookies[config.cookieName]
    || (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return next();
  }

  const user = await authService.resolveLogoutUser(token);
  if (user) {
    req.user = user;
  }

  return next();
}

module.exports = { authenticate, authorize, resolveUserForLogout };
