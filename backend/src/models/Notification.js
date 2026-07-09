const mongoose = require('mongoose');

const AUDIENCES = ['all_customers', 'active_customers'];
const PRIORITIES = ['normal', 'important'];
const STATUSES = ['sent', 'archived'];

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    audience: {
      type: String,
      required: true,
      enum: AUDIENCES,
      default: 'all_customers'
    },
    priority: {
      type: String,
      required: true,
      enum: PRIORITIES,
      default: 'normal'
    },
    status: {
      type: String,
      required: true,
      enum: STATUSES,
      default: 'sent'
    },
    recipientCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sentAt: { type: Date, default: Date.now },
    archivedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ audience: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
