const express = require('express');
const { rateLimit } = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { authenticate, resolveUserForLogout } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

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

router.get('/logout', asyncHandler(resolveUserForLogout), asyncHandler(authController.logout));

router.post('/logout', asyncHandler(resolveUserForLogout), asyncHandler(authController.logout));

/* Hỗ trợ logout kiểu form/JS fallback: /api/v1/auth/logout?redirect=... */
router.all('/logout', asyncHandler(resolveUserForLogout), asyncHandler(authController.logout));

module.exports = router;
