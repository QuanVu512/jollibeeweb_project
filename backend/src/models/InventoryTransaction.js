const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', default: null, index: true },
    type: {
      type: String,
      required: true,
      enum: ['import', 'adjustment', 'sale', 'cancel_return']
    },
    quantityChange: { type: Number, required: true },
    stockBefore: { type: Number, required: true, min: 0 },
    stockAfter: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
    supplierName: { type: String, trim: true, maxlength: 160, default: '' },
    referenceCode: { type: String, trim: true, maxlength: 80, default: '' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, trim: true, maxlength: 300, default: '' }
  },
  { timestamps: true, updatedAt: false }
);

inventoryTransactionSchema.index({ product: 1, createdAt: -1 });
inventoryTransactionSchema.index({ ingredient: 1, createdAt: -1 });
inventoryTransactionSchema.index({ type: 1, createdAt: -1 });
inventoryTransactionSchema.index({ supplier: 1, createdAt: -1 });
inventoryTransactionSchema.index({ createdBy: 1, createdAt: -1 });

inventoryTransactionSchema.pre('validate', function calculateTotalCost() {
  this.totalCost = Math.abs(this.quantityChange) * this.unitCost;
});

inventoryTransactionSchema.pre('validate', function requireStockTarget() {
  if (!this.product && !this.ingredient) {
    this.invalidate('product', 'Cần chọn món ăn hoặc nguyên liệu cho giao dịch kho.');
  }
});

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
