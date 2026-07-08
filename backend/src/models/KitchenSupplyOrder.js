const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../constants/orderStatus');

const kitchenSupplyOrderItemSchema = new mongoose.Schema(
  {
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    ingredientCode: { type: String, trim: true, uppercase: true, required: true },
    ingredientName: { type: String, trim: true, required: true },
    quantityBase: { type: Number, required: true, min: 1 },
    unitBase: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const kitchenSupplyOrderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, trim: true, default: undefined },

    items: { type: [kitchenSupplyOrderItemSchema], default: [], validate: (v) => v.length > 0 },

    // pending: đã tạo nhưng chưa cộng vào kho
    // confirmed: đã cộng vào kho
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true
    },

    note: { type: String, trim: true, maxlength: 300, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

kitchenSupplyOrderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('KitchenSupplyOrder', kitchenSupplyOrderSchema);
