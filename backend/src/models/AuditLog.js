const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true, trim: true, maxlength: 100 },
    entityType: {
      type: String,
      required: true,
      enum: ['user', 'employee', 'customer', 'category', 'product', 'supplier', 'order', 'inventory', 'payment']
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
    ipAddress: { type: String, trim: true, maxlength: 80, default: '' },
    userAgent: { type: String, trim: true, maxlength: 300, default: '' },
    createdAt: { type: Date, default: Date.now, immutable: true }
  },
  { versionKey: false }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
