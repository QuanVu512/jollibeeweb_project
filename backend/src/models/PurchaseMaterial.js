const mongoose = require('mongoose');

const ORDER_UNITS = ['case', 'bag', 'pack', 'pcs'];

const purchaseMaterialSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    supplierName: { type: String, trim: true, maxlength: 160, default: '' },
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true, index: true },
    ingredientCode: { type: String, required: true, trim: true, uppercase: true },
    orderUnit: { type: String, required: true, enum: ORDER_UNITS },
    orderUnitLabel: { type: String, required: true, trim: true, maxlength: 80 },
    stockUnit: { type: String, required: true, trim: true, maxlength: 40 },
    stockQuantityPerOrderUnit: { type: Number, required: true, min: 0.000001 },
    isActive: { type: Boolean, default: true },
    note: { type: String, trim: true, maxlength: 300, default: '' }
  },
  { timestamps: true }
);

purchaseMaterialSchema.index({ isActive: 1, orderUnit: 1 });

module.exports = mongoose.model('PurchaseMaterial', purchaseMaterialSchema);
