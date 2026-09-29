const express = require('express');
const controller = require('../controllers/report.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/summary', asyncHandler(controller.summary));
router.get('/transactions', asyncHandler(controller.transactions));
router.get('/customers', asyncHandler(controller.customers));
router.get('/export', asyncHandler(controller.exportReport));

module.exports = router;
