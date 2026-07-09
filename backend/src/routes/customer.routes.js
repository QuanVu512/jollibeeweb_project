const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/notifications',
  authenticate,
  authorize(ROLES.CUSTOMER),
  asyncHandler(notificationController.listCustomerNotifications)
);

module.exports = router;
