const mongoose = require('mongoose');
const Counter = require('./Counter');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 50, default: 'Mặc định' },
    recipientName: { type: String, trim: true, maxlength: 120, default: '' },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    addressLine: { type: String, trim: true, maxlength: 300, required: true },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: false }
);

const customerSchema = new mongoose.Schema(
  {
    customerCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    email: { type: String, trim: true, lowercase: true, maxlength: 160, default: '' },
    birthDate: { type: Date, default: null },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    address: { type: String, trim: true, maxlength: 300, default: '' },
    addresses: { type: [addressSchema], default: [] },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true
    },
    loyaltyPoints: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ isActive: 1, createdAt: -1 });

customerSchema.pre('validate', async function assignCustomerCode() {
  if (this.customerCode) return;
  const counter = await Counter.findByIdAndUpdate(
    'customer',
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  this.customerCode = `KH${String(counter.sequence).padStart(4, '0')}`;
});

module.exports = mongoose.model('Customer', customerSchema);
