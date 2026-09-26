const mongoose = require('mongoose');

// Sub-admins created by the super admin. Access can be limited to a time window:
// accessStart/accessEnd null = unlimited. Enforced at login AND on every request.
const adminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['super', 'admin'], default: 'admin' },
    accessStart: { type: Date, default: null },
    accessEnd: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    // Granular rights picked by the super admin. Super role bypasses all checks.
    permissions: {
      registrations: {
        view: { type: Boolean, default: true },
        manage: { type: Boolean, default: false },
        remove: { type: Boolean, default: false },
      },
      events: {
        view: { type: Boolean, default: true },
        manage: { type: Boolean, default: false },
        remove: { type: Boolean, default: false },
      },
      team: {
        view: { type: Boolean, default: true },
        manage: { type: Boolean, default: false },
        remove: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

adminUserSchema.methods.isAccessValid = function (now = new Date()) {
  if (!this.isActive) return { ok: false, reason: 'Account disabled by super admin' };
  if (this.role === 'super') return { ok: true };
  if (this.accessStart && now < this.accessStart) return { ok: false, reason: 'Access window has not started yet' };
  if (this.accessEnd && now > this.accessEnd) return { ok: false, reason: 'Access window has expired' };
  return { ok: true };
};

adminUserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
