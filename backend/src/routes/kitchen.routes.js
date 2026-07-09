const express = require('express');
const Ingredient = require('../models/Ingredient');
const { renderKitchenPage } = require('../services/kitchenView');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const kitchenOrAdmin = authorize(ROLES.KITCHEN, ROLES.ADMIN);

router.get('/view', authenticate, kitchenOrAdmin, (_req, res) => {
  res.send(renderKitchenPage([]));
});

router.get('/ingredients', authenticate, kitchenOrAdmin, asyncHandler(async (_req, res) => {
  const ingredients = await Ingredient.find({}).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: ingredients });
}));

router.post('/ingredients', authenticate, kitchenOrAdmin, asyncHandler(async (req, res) => {
  const { code, name, supplierName = '', baseUnit, stockQuantity = 0, isActive = true } = req.body || {};

  if (!code || !name || !baseUnit) {
    throw new ApiError(400, 'Vui lòng nhập mã, tên và đơn vị nguyên liệu.');
  }

  const ingredient = await Ingredient.create({
    code: String(code).trim().toUpperCase(),
    name: String(name).trim(),
    supplierName: String(supplierName || '').trim(),
    baseUnit: String(baseUnit).trim(),
    stockQuantity: Number.isFinite(Number(stockQuantity)) ? Number(stockQuantity) : 0,
    isActive: typeof isActive === 'boolean' ? isActive : true
  });

  res.status(201).json({ success: true, data: ingredient });
}));

router.put('/ingredients/:id', authenticate, kitchenOrAdmin, asyncHandler(async (req, res) => {
  const { code, name, supplierName = '', baseUnit, stockQuantity = 0, isActive = true } = req.body || {};

  if (!code || !name || !baseUnit) {
    throw new ApiError(400, 'Vui lòng nhập mã, tên và đơn vị nguyên liệu.');
  }

  const ingredient = await Ingredient.findById(req.params.id);
  if (!ingredient) {
    throw new ApiError(404, 'Không tìm thấy nguyên liệu.');
  }

  ingredient.code = String(code).trim().toUpperCase();
  ingredient.name = String(name).trim();
  ingredient.supplierName = String(supplierName || '').trim();
  ingredient.baseUnit = String(baseUnit).trim();
  ingredient.stockQuantity = Number.isFinite(Number(stockQuantity)) ? Number(stockQuantity) : 0;
  ingredient.isActive = typeof isActive === 'boolean' ? isActive : true;
  await ingredient.save();

  res.json({ success: true, data: ingredient });
}));

router.delete('/ingredients/:id', authenticate, kitchenOrAdmin, asyncHandler(async (req, res) => {
  const ingredient = await Ingredient.findById(req.params.id);
  if (!ingredient) {
    throw new ApiError(404, 'Không tìm thấy nguyên liệu.');
  }

  await ingredient.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
}));

router.post('/inventory/adjust', authenticate, kitchenOrAdmin, asyncHandler(async (req, res) => {
  const { ingredientId, change, note = '' } = req.body || {};
  const delta = Number(change);


  if (!ingredientId || !Number.isFinite(delta)) {
    throw new ApiError(400, 'Vui lòng chọn nguyên liệu và nhập số lượng thay đổi.');
  }

  const ingredient = await Ingredient.findById(ingredientId);
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
