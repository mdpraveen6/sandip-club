const mongoose = require('mongoose');

// Every admin action, visible to the super admin in the Activity tab.
// action: login | login-failed | create | update | delete | accept | resend
// entity: registration | event | team | admin | auth
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true, trim: true },
    role: { type: String, default: '' },
    action: { type: String, required: true, trim: true },
    entity: { type: String, required: true, trim: true },
    entityId: { type: String, default: '' },
    summary: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
