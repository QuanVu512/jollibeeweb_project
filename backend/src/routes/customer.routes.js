const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const profileController = require('../controllers/customerProfile.controller');
const orderController = require('../controllers/customerOrder.controller');
router.get('/profile', authenticate, authorize(ROLES.CUSTOMER), asyncHandler(profileController.getProfile));
router.patch('/profile', authenticate, authorize(ROLES.CUSTOMER), asyncHandler(profileController.updateProfile));
router.get('/orders', authenticate, authorize(ROLES.CUSTOMER), asyncHandler(orderController.listMyOrders));
router.patch('/orders/:id/address', authenticate, authorize(ROLES.CUSTOMER), asyncHandler(orderController.updateMyOrderAddress));
router.patch('/orders/:id/cancel', authenticate, authorize(ROLES.CUSTOMER), asyncHandler(orderController.cancelMyOrder));

router.get(
  '/notifications',
  authenticate,
  authorize(ROLES.CUSTOMER),
  asyncHandler(notificationController.listCustomerNotifications)
);

module.exports = router;
