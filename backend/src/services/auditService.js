const AuditLog = require('../models/AuditLog');

function snapshot(value) {
  if (value === null || value === undefined) return null;
  const result = typeof value.toObject === 'function'
    ? value.toObject({ depopulate: true, versionKey: false })
    : structuredClone(value);
  if (result && typeof result === 'object') delete result.passwordHash;
  return result;
}

async function recordAudit(req, event, session = null) {
  const entry = {
    actor: event.actor || req.user?._id || null,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId || null,
    before: snapshot(event.before),
    after: snapshot(event.after),
    ipAddress: req.ip || req.socket?.remoteAddress || '',
    userAgent: String(req.get?.('user-agent') || '').slice(0, 300)
  };

  if (session) {
    const [created] = await AuditLog.create([entry], { session });
    return created;
  }
  return AuditLog.create(entry);
}

module.exports = { recordAudit, snapshot };
