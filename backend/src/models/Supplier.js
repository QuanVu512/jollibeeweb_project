const mongoose = require('mongoose');
const Counter = require('./Counter');

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    contactName: { type: String, trim: true, maxlength: 120, default: '' },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    email: { type: String, trim: true, lowercase: true, maxlength: 160, default: '' },
    address: { type: String, trim: true, maxlength: 300, default: '' },
    taxCode: { type: String, trim: true, maxlength: 30, default: '' },
    isActive: { type: Boolean, default: true },
    note: { type: String, trim: true, maxlength: 300, default: '' }
  },
  { timestamps: true }
);

supplierSchema.index({ isActive: 1, name: 1 });

supplierSchema.pre('validate', async function assignSupplierCode() {
  if (this.supplierCode) return;
  const counter = await Counter.findByIdAndUpdate(
    'supplier',
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  this.supplierCode = `NCC${String(counter.sequence).padStart(4, '0')}`;
});

module.exports = mongoose.model('Supplier', supplierSchema);
