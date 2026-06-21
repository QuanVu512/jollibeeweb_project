const express = require('express');
const { rateLimit } = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
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
router.get('/me', authenticate, authorize(ROLES.ADMIN), asyncHandler(authController.me));
router.post('/logout', authenticate, asyncHandler(authController.logout));

module.exports = router;
