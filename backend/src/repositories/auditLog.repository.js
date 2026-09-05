const AuditLog = require('../models/AuditLog');

async function create(entry, session = null) {
  if (session) {
    const [created] = await AuditLog.create([entry], { session });
    return created;
  }
  return AuditLog.create(entry);
}

module.exports = { create };
