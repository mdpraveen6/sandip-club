const AuditLog = require('../models/AuditLog');

// Fire-and-forget audit writer. Always .catch() at call sites — logging must
// never break the actual request.
function logAudit({ actor = 'system', role = '', action = '', entity = '', entityId = '', summary = '' }) {
  return AuditLog.create({
    actor,
    role,
    action,
    entity,
    entityId: String(entityId || ''),
    summary: String(summary || '').slice(0, 500),
  }).catch((e) => console.error('[audit]', e.message));
}

// Who performed this request? Used for audit actor fields.
function actorOf(req) {
  if (req.adminRole === 'super') {
    return { actor: String(process.env.SUPER_ADMIN_EMAIL || 'super-admin'), role: 'super' };
  }
  if (req.admin && req.admin.email) {
    return { actor: req.admin.email, role: req.adminRole || req.admin.role || 'admin' };
  }
  return { actor: 'public site', role: 'public' };
}

module.exports = { logAudit, actorOf };
