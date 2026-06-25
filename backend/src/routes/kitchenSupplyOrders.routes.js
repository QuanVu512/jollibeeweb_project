const express = require('express');
const mongoose = require('mongoose');

const Ingredient = require('../models/Ingredient');
const KitchenSupplyOrder = require('../models/KitchenSupplyOrder');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Lịch sử đơn đặt nguyên liệu (bếp thao tác)
router.get(
  '/orders',
  authenticate,
  authorize(ROLES.KITCHEN),
  asyncHandler(async (_req, res) => {
    const orders = await KitchenSupplyOrder.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  })
);

// Tạo đơn pending từ UI
router.post(
  '/orders',
  authenticate,
  authorize(ROLES.KITCHEN),
  asyncHandler(async (req, res) => {
    const { items = [], note = '' } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Vui lòng chọn ít nhất 1 nguyên liệu.');
    }

    const normalizedItems = items.map((it) => {
      const ingredientId = it?.ingredientId || it?.ingredient?._id || it?.id;
      const quantityBase = Number(it?.quantityBase ?? it?.quantity ?? 0);

      if (!ingredientId) return null;
      if (!Number.isFinite(quantityBase) || quantityBase < 1) return null;

      return {
        ingredient: mongoose.Types.ObjectId.isValid(ingredientId)
          ? ingredientId
          : undefined,
        ingredientCode: String(it.ingredientCode || '').trim().toUpperCase(),
        ingredientName: String(it.ingredientName || '').trim(),
        quantityBase,
        unitBase: String(it.unitBase || '').trim()
      };
    });

    const validItems = normalizedItems.filter(Boolean);
    if (validItems.length === 0) {
      throw new ApiError(400, 'Dữ liệu nguyên liệu không hợp lệ.');
    }

    // Validate ingredient tồn tại
    const ingredientIds = validItems.map((i) => i.ingredient);
    const ingredients = await Ingredient.find({ _id: { $in: ingredientIds } }).select('_id code name');
    const ingredientMap = new Map(ingredients.map((x) => [String(x._id), x]));

    const finalItems = validItems.map((i) => {
      const db = ingredientMap.get(String(i.ingredient));
      if (!db) {
        throw new ApiError(404, `Không tìm thấy nguyên liệu: ${i.ingredient}`);
      }
      return {
        ingredient: i.ingredient,
        ingredientCode: i.ingredientCode || db.code,
        ingredientName: i.ingredientName || db.name,
        quantityBase: i.quantityBase,
        unitBase: i.unitBase
      };
    });

    const order = await KitchenSupplyOrder.create({
      items: finalItems,
      note
    });

    res.status(201).json({ success: true, data: order });
  })
);

// Confirm: cộng vào kho (B theo yêu cầu của bạn)
router.post(
  '/orders/:id/confirm',
  authenticate,
  authorize(ROLES.KITCHEN),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { note = '' } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'ID đơn đặt không hợp lệ.');
    }

    const order = await KitchenSupplyOrder.findById(id);
    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn đặt.');
    }

    if (order.status === 'confirmed') {
      return res.json({ success: true, data: order });
    }
    if (order.status === 'cancelled') {
      throw new ApiError(400, 'Đơn đặt đã bị hủy.');
    }

    // Cộng kho theo từng item
    for (const item of order.items) {
      const ingredient = await Ingredient.findById(item.ingredient);
      if (!ingredient) {
        throw new ApiError(404, `Không tìm thấy nguyên liệu: ${item.ingredient}`);
      }

      ingredient.stockQuantity = ingredient.stockQuantity + Number(item.quantityBase);
      await ingredient.save();
    }

    order.status = 'confirmed';
    order.confirmedBy = req.user?._id || null;
    if (note) {
      order.note = [order.note, String(note)].filter(Boolean).join(' | ').slice(0, 300);
    }

    await order.save();

    res.json({ success: true, data: order });
  })
);

module.exports = router;

