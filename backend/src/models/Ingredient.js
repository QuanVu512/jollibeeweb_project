const mongoose = require('mongoose');

const packagingSchema = new mongoose.Schema(
  {
    unit: { type: String, required: true, trim: true, maxlength: 40 },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    baseQuantity: { type: Number, required: true, min: 0.000001 },
    note: { type: String, trim: true, maxlength: 200, default: '' }
  },
  { _id: false }
);

const ingredientSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    supplierName: { type: String, trim: true, maxlength: 160, default: '' },
    baseUnit: { type: String, required: true, trim: true, maxlength: 40 },
    stockQuantity: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    packaging: { type: [packagingSchema], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ingredientSchema.index({ isActive: 1, stockQuantity: 1 });

module.exports = mongoose.model('Ingredient', ingredientSchema);
