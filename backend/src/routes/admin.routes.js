const express = require('express');
const employeeRoutes = require('./employee.routes');
const accountRoutes = require('./account.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.use('/employees', employeeRoutes);
router.use('/accounts', accountRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
