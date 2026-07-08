const express = require('express');
const PurchaseMaterial = require('../models/PurchaseMaterial');
const { renderKitchenPage } = require('../services/kitchenView');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/view', authenticate, authorize(ROLES.KITCHEN), (_req, res) => {
  res.send(renderKitchenPage([]));
});

router.get('/ingredients', authenticate, authorize(ROLES.KITCHEN), asyncHandler(async (_req, res) => {
  const ingredients = await PurchaseMaterial.find({}).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: ingredients });
}));

router.post('/inventory/adjust', authenticate, authorize(ROLES.KITCHEN), asyncHandler(async (req, res) => {

  const { ingredientId, change, note = '' } = req.body || {};
  const delta = Number(change);


  if (!ingredientId || !Number.isFinite(delta)) {
    throw new ApiError(400, 'Vui lòng chọn nguyên liệu và nhập số lượng thay đổi.');
  }

  const ingredient = await PurchaseMaterial.findById(ingredientId);
  if (!ingredient) {
    throw new ApiError(404, 'Không tìm thấy nguyên liệu.');
  }

  const nextStock = ingredient.stockQuantity + delta;
  if (nextStock < 0) {
    throw new ApiError(400, 'Số lượng tồn kho không thể âm.');
  }

  ingredient.stockQuantity = nextStock;
  await ingredient.save();

  res.json({ success: true, data: { ingredient, delta, note } });
}));

module.exports = router;
