const express = require('express');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { config } = require('../config/env');
const User = require('../models/User');

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Bạn đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.' }
});

router.post('/login', loginLimiter, asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register)); 
router.get('/me', authenticate, asyncHandler(authController.me));

/* Logout: không yêu cầu token còn hạn — vẫn xóa cookie và redirect */
router.get('/logout', asyncHandler(async (req, res, next) => {
  await resolveUserForLogout(req);
  return next();
}), asyncHandler(authController.logout));

router.post('/logout', asyncHandler(async (req, res, next) => {
  await resolveUserForLogout(req);
  return next();
}), asyncHandler(authController.logout));

/* Hỗ trợ logout kiểu form/JS fallback: /api/v1/auth/logout?redirect=... */
router.all('/logout', asyncHandler(async (req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') return next();
  await resolveUserForLogout(req);
  return next();
}), asyncHandler(authController.logout));


/* Helper: parse token với ignoreExpiration để lấy user (nếu có) */
async function resolveUserForLogout(req) {
  const token = req.cookies[config.cookieName] ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  if (!token) return;

  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      issuer: 'jollibee-admin-api',
      audience: 'jollibee-admin',
      ignoreExpiration: true
    });
    const user = await User.findById(payload.sub).select('+tokenVersion _id isActive');
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (_) {
    // Token hỏng / không parse được → vẫn cho logout (req.user sẽ undefined)
  }
}

module.exports = router;
