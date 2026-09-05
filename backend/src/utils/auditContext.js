function auditContext(req) {
  return {
    actor: req.user?._id || null,
    ipAddress: req.ip || req.socket?.remoteAddress || '',
    userAgent: String(req.get?.('user-agent') || '').slice(0, 300)
  };
}

module.exports = auditContext;
