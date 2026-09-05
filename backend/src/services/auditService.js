const auditLogRepository = require('../repositories/auditLog.repository');

function snapshot(value) {
  if (value === null || value === undefined) return null;
  const result = typeof value.toObject === 'function'
    ? value.toObject({ depopulate: true, versionKey: false })
    : structuredClone(value);
  if (result && typeof result === 'object') delete result.passwordHash;
  return result;
}

async function recordAudit(context, event, session = null) {
  const entry = {
    actor: event.actor || context.actor || null,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId || null,
    before: snapshot(event.before),
    after: snapshot(event.after),
    ipAddress: context.ipAddress,
    userAgent: context.userAgent
  };

  return auditLogRepository.create(entry, session);
}

module.exports = { recordAudit, snapshot };
