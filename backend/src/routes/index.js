const express = require('express');
const authRoutes = require('./auth.routes');
const employeeRoutes = require('./employee.routes');
const accountRoutes = require('./account.routes');
const reportRoutes = require('./report.routes');
const adminRoutes = require('./admin.routes');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use('/auth', authRoutes);
const adminOnly = [authenticate, authorize(ROLES.ADMIN)];

// Đường dẫn chuẩn cho toàn bộ phần quản trị. Các vai trò khác có thể
// gắn router riêng bên cạnh /admin mà không bị middleware admin chặn.
router.use('/admin', ...adminOnly, adminRoutes);

// Giữ tương thích với frontend admin hiện tại trong lúc chuyển dần sang /admin/*.
router.use('/employees', ...adminOnly, employeeRoutes);
router.use('/accounts', ...adminOnly, accountRoutes);
router.use('/reports', ...adminOnly, reportRoutes);

module.exports = router;
