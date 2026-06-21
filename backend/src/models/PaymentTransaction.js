const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    type: { type: String, enum: ['payment', 'refund'], default: 'payment' },
    method: { type: String, enum: ['cash', 'card', 'e_wallet', 'cod'], required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    transactionReference: { type: String, trim: true, maxlength: 160, default: '' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    processedAt: { type: Date, default: Date.now },
    note: { type: String, trim: true, maxlength: 300, default: '' }
  },
  { timestamps: true, updatedAt: false }
);

paymentTransactionSchema.index({ status: 1, method: 1, processedAt: -1 });
paymentTransactionSchema.index({ processedBy: 1, processedAt: -1 });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
