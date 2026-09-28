const mongoose = require('mongoose');
const Order = require('../models/Order');
const Ingredient = require('../models/Ingredient');
const InventoryTransaction = require('../models/InventoryTransaction');
const ApiError = require('../utils/ApiError');

async function cancelPendingOrder(filter, userId, reason) {
  let savedOrder;
  await mongoose.connection.transaction(async session => {
    const order = await Order.findOne({ ...filter, status: 'pending' }).session(session);
    if (!order) throw new ApiError(409, 'Đơn đã được chế biến hoặc không còn có thể hủy.');
    if (order.inventoryDeductedAt) {
      // Restore recorded quantities, independent of later recipe edits.
      const movements = await InventoryTransaction.find({ order: order._id, type: { $in: ['sale', 'adjustment', 'cancel_return'] }, ingredient: { $ne: null } }).session(session);
      const outstanding = new Map();
      for (const movement of movements) {
        const id = String(movement.ingredient);
        const entry = outstanding.get(id) || { ingredient: movement.ingredient, quantityChange: 0 };
        entry.quantityChange += movement.quantityChange;
        outstanding.set(id, entry);
      }
      for (const movement of outstanding.values()) {
        const quantity = Math.round(-movement.quantityChange * 1000000) / 1000000;
        if (!(quantity > 0)) continue;
        const ingredient = await Ingredient.findByIdAndUpdate(movement.ingredient,
          { $inc: { stockQuantity: quantity } }, { new: true, session });
        if (!ingredient) throw new ApiError(409, 'Không thể hoàn nguyên liệu đã bị xóa.');
        await InventoryTransaction.create([{
          ingredient: ingredient._id, order: order._id, type: 'cancel_return',
          quantityChange: quantity, stockBefore: ingredient.stockQuantity - quantity,
          stockAfter: ingredient.stockQuantity, referenceCode: order.orderCode,
          createdBy: userId, note: 'Hoàn nguyên liệu của đơn hủy trước chế biến'
        }], { session });
      }
    }
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.statusHistory.push({ status: 'cancelled', changedBy: userId, note: reason });
    await order.save({ session });
    savedOrder = order;
  });
  return savedOrder;
}
module.exports = cancelPendingOrder;
