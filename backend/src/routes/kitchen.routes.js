const express = require('express');

const controller = require('../controllers/kitchen.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const kitchenOrAdmin = authorize(ROLES.KITCHEN, ROLES.ADMIN);
const kitchenAccess = [authenticate, kitchenOrAdmin];

router.get('/view', ...kitchenAccess, controller.showKitchenView);
router.get('/ingredients', ...kitchenAccess, asyncHandler(controller.listIngredients));
router.post('/ingredients', ...kitchenAccess, asyncHandler(controller.createIngredient));
router.put('/ingredients/:id', ...kitchenAccess, asyncHandler(controller.updateIngredient));
router.delete('/ingredients/:id', ...kitchenAccess, asyncHandler(controller.deleteIngredient));
router.post('/inventory/adjust', ...kitchenAccess, asyncHandler(controller.adjustInventory));

module.exports = router;
