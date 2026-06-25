const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../constants/orderStatus');
const Counter = require('./Counter');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    productCode: { type: String, trim: true, default: '' },
    categoryCode: { type: String, trim: true, default: '' },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true, enum: Object.values(ORDER_STATUS) },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    note: { type: String, trim: true, maxlength: 300, default: '' },
    changedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: { type: String, enum: ['cash', 'card', 'e_wallet', 'cod'], default: 'cash' },
    status: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    paidAt: { type: Date, default: null },
    transactionReference: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    customerName: { type: String, trim: true, default: 'Khách lẻ' },
    customerPhone: { type: String, trim: true, default: '' },
    orderedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    subtotal: { type: Number, min: 0, default: 0 },
    shippingFee: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    deliveryAddress: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true
    },
    orderType: { type: String, enum: ['dine_in', 'pickup', 'delivery'], default: 'dine_in' },
    source: { type: String, enum: ['web', 'pos', 'phone', 'legacy'], default: 'web' },
    branchCode: { type: String, trim: true, uppercase: true, default: 'MAIN' },
    items: { type: [orderItemSchema], default: [] },
    payment: { type: paymentSchema, default: () => ({}) },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedShipper: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    statusHistory: { type: [statusHistorySchema], default: [] },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    cancellationReason: { type: String, trim: true, maxlength: 300, default: '' },
    failureReason: { type: String, trim: true, maxlength: 300, default: '' }
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, orderedAt: -1 });
orderSchema.index({ assignedShipper: 1, status: 1 });
orderSchema.index({ orderType: 1, orderedAt: -1 });
orderSchema.index({ source: 1, orderedAt: -1 });
orderSchema.index({ 'payment.method': 1, 'payment.status': 1, orderedAt: -1 });
orderSchema.index({ customer: 1, orderedAt: -1 });
orderSchema.index({ createdBy: 1, orderedAt: -1 });

orderSchema.pre('validate', async function assignOrderCode() {
  if (!this.orderCode) {
    let unique = false;
    let code = '';
    while (!unique) {
      const counter = await Counter.findByIdAndUpdate(
        'order',
        { $inc: { sequence: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      code = `DH${String(counter.sequence).padStart(6, '0')}`;
      const existing = await this.constructor.findOne({ orderCode: code });
      if (!existing) {
        unique = true;
      }
    }
    this.orderCode = code;
  }

  this.items.forEach((item) => {
    item.lineTotal = item.quantity * item.unitPrice;
  });

  this.subtotal = this.items.reduce((sum, item) => sum + item.lineTotal, 0);
  this.total = Math.max(0, this.subtotal + this.shippingFee - this.discount);

  if (this.status === ORDER_STATUS.COMPLETED && !this.completedAt) {
    this.completedAt = new Date();
  }

  if (this.status === ORDER_STATUS.CANCELLED && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }

  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status, changedAt: this.orderedAt || new Date() });
  }
});

module.exports = mongoose.model('Order', orderSchema);
