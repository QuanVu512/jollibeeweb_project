const mongoose = require('mongoose');
const Counter = require('./Counter');

const productSchema = new mongoose.Schema(
  {
    productCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    unit: { type: String, trim: true, default: 'phần', maxlength: 30 },
    reorderLevel: { type: Number, default: 10, min: 0 },
    image: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    categoryCode: { type: String, trim: true, default: '', index: true }
  },
  { timestamps: true }
);

productSchema.index({ categoryCode: 1, isActive: 1 });
productSchema.index({ stock: 1, reorderLevel: 1, isActive: 1 });

productSchema.pre('validate', async function assignProductCode() {
  if (this.productCode) return;
  const counter = await Counter.findByIdAndUpdate(
    'product',
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  this.productCode = `MON${String(counter.sequence).padStart(4, '0')}`;
});

module.exports = mongoose.model('Product', productSchema);
