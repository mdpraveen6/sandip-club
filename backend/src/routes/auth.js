const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');
const PasswordToken = require('../models/PasswordToken');
const { signToken, requireAuth } = require('../middleware/auth');
const { isEmail } = require('../utils/validate');
const { sendResetCodeEmail } = require('../utils/mailer');
const { logAudit } = require('../utils/audit');

const router = express.Router();

// Timing-safe string compare for the env-stored super-admin password.
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function codeHash(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function makeCode() {
  return String(crypto.randomInt(100000, 1000000));
}

// POST /api/auth/login { email, password }
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    // 1) Super admin from env (no DB row needed).
    const superEmail = String(process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
    const superPass = String(process.env.SUPER_ADMIN_PASSWORD || '');
    if (superEmail && email === superEmail) {
      if (!superPass || !safeEqual(password, superPass)) {
        logAudit({ actor: email, role: 'super?', action: 'login-failed', entity: 'auth', summary: 'Wrong super-admin password' }).catch(() => {});
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const token = signToken({ role: 'super', email: superEmail });
      logAudit({ actor: superEmail, role: 'super', action: 'login', entity: 'auth', summary: 'Super admin signed in' }).catch(() => {});
      return res.json({ token, admin: { email: superEmail, role: 'super' } });
    }

    // 2) Sub-admins from DB with enforced time windows.
    const user = await AdminUser.findOne({ email });
    if (!user) {
      logAudit({ actor: email, role: '?', action: 'login-failed', entity: 'auth', summary: 'Unknown email' }).catch(() => {});
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const check = user.isAccessValid(new Date());
    if (!check.ok) {
      logAudit({ actor: email, role: 'admin', action: 'login-failed', entity: 'auth', summary: check.reason }).catch(() => {});
      return res.status(403).json({ error: check.reason });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      logAudit({ actor: email, role: 'admin', action: 'login-failed', entity: 'auth', summary: 'Wrong password' }).catch(() => {});
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ sub: user._id.toString(), role: 'admin' });
    logAudit({ actor: email, role: 'admin', action: 'login', entity: 'auth', summary: 'Signed in' }).catch(() => {});
    return res.json({ token, admin: user.toJSON() });
  } catch (err) {
    console.error('[auth/login]', err.message);
    return res.status(500).json({ error: 'Login failed. Try again.' });
  }
});

// GET /api/auth/me — who am I (used to restore sessions + re-check windows).
router.get('/me', requireAuth, async (req, res) => {
  if (req.adminRole === 'super') {
    return res.json({ admin: { email: String(process.env.SUPER_ADMIN_EMAIL || ''), role: 'super' } });
  }
  return res.json({ admin: req.admin.toJSON() });
});

// POST /api/auth/forgot { email } — email a 6-digit code (sub-admins only).
// Always replies generically so addresses can't be probed — except when SMTP
// itself is down, which is reported honestly since nothing can proceed.
router.post('/forgot', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!isEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
    const user = await AdminUser.findOne({ email });
    if (user && user.isActive) {
      await PasswordToken.deleteMany({ email, purpose: 'reset', usedAt: null });
      const code = makeCode();
      await PasswordToken.create({
        email,
        codeHash: codeHash(code),
        purpose: 'reset',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
      const r = await sendResetCodeEmail(email, code);
      if (!r.sent) return res.status(500).json({ error: r.error || 'Email service not configured' });
    }
    return res.json({ ok: true, message: 'If an admin account exists for this email, a verification code was sent.' });
  } catch (err) {
    console.error('[auth/forgot]', err.message);
    return res.status(500).json({ error: 'Could not send code. Try again.' });
  }
});

// POST /api/auth/reset { email, code, newPassword } — single-step verify + set.
router.post('/reset', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    const newPassword = String(req.body.newPassword || '');
    if (!isEmail(email) || !code) return res.status(400).json({ error: 'Email and verification code are required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

    const fail = () => res.status(400).json({ error: 'Invalid or expired code' });
    const user = await AdminUser.findOne({ email });
    if (!user) return fail();
    // Accepts both forgot-password codes and invite setup codes.
    const tok = await PasswordToken.findOne({
      email, purpose: { $in: ['reset', 'setup'] }, usedAt: null, expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
    if (!tok || tok.attempts >= 5) return fail();
    tok.attempts += 1;
    await tok.save();
    if (tok.codeHash !== codeHash(code)) return fail();
    tok.usedAt = new Date();
    await tok.save();
    await PasswordToken.deleteMany({ email, _id: { $ne: tok._id } });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    logAudit({ actor: email, role: 'admin', action: 'update', entity: 'auth', entityId: String(user._id), summary: 'Password reset via email code' }).catch(() => {});
    return res.json({ ok: true, message: 'Password updated. You can sign in now.' });
  } catch (err) {
    console.error('[auth/reset]', err.message);
    return res.status(500).json({ error: 'Reset failed. Try again.' });
  }
});

module.exports = router;
