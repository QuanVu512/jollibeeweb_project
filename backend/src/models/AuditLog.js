const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true, trim: true, maxlength: 100 },
    entityType: {
      type: String,
      required: true,
      enum: ['user', 'employee', 'customer', 'category', 'product', 'supplier', 'order', 'inventory', 'payment', 'notification', 'shiftTemplate', 'employeeShift', 'attendance']
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
    reason: { type: String, trim: true, maxlength: 500 },
    requestId: { type: String, maxlength: 80 },
    fingerprint: { type: String, maxlength: 64 },
    response: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String, trim: true, maxlength: 80, default: '' },
    userAgent: { type: String, trim: true, maxlength: 300, default: '' },
    createdAt: { type: Date, default: Date.now, immutable: true }
  },
  { versionKey: false }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, requestId: 1 }, {
  unique: true, partialFilterExpression: { requestId: { $type: 'string' } }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
