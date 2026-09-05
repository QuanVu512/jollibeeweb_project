const express = require('express');

const controller = require('../controllers/kitchenSupplyOrder.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate, authorize(ROLES.KITCHEN));

router.get('/purchase-materials', asyncHandler(controller.listPurchaseMaterials));
router.get('/orders', asyncHandler(controller.listOrders));
router.post('/orders', asyncHandler(controller.createOrder));
router.post('/orders/:id/confirm', asyncHandler(controller.confirmOrder));
router.post('/orders/:id/cancel', asyncHandler(controller.cancelOrder));

module.exports = router;
