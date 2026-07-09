const express = require('express');
const employeeRoutes = require('./employee.routes');
const accountRoutes = require('./account.routes');
const reportRoutes = require('./report.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

router.use('/employees', employeeRoutes);
router.use('/accounts', accountRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
