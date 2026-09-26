const mongoose = require('mongoose');

// Single-use email codes for password setup (invite) and forgot-password reset.
// Only the SHA-256 hash is stored; codes live 15 min (reset) or 48 h (setup).
const passwordTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ['setup', 'reset'], required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

passwordTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordToken', passwordTokenSchema);
