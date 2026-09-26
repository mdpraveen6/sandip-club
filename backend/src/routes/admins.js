const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');
const PasswordToken = require('../models/PasswordToken');
const { requireAuth, requireSuper } = require('../middleware/auth');
const { isEmail } = require('../utils/validate');
const { sendAccessInviteEmail } = require('../utils/mailer');
const { logAudit, actorOf } = require('../utils/audit');

const router = express.Router();
router.use(requireAuth, requireSuper);

const PERM_MODULES = ['registrations', 'events', 'team'];
const PERM_ACTIONS = ['view', 'manage', 'remove'];

// Whitelist-coerced permission matrix from admin UI checkboxes.
function sanitizePermissions(input) {
  const out = {};
  for (const m of PERM_MODULES) {
    out[m] = {};
    for (const a of PERM_ACTIONS) out[m][a] = !!(input && input[m] && input[m][a]);
  }
  return out;
}

function makeCode() {
  return String(crypto.randomInt(100000, 1000000));
}

// GET /api/admins — super: list sub-admins (hashes stripped by toJSON).
router.get('/', async (req, res) => {
  try {
    const items = await AdminUser.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ items: items.map(({ passwordHash, ...rest }) => rest) });
  } catch (err) {
    console.error('[admins:list]', err.message);
    return res.status(500).json({ error: 'Could not load admins' });
  }
});

// POST /api/admins — super: invite { email, accessStart?, accessEnd?, permissions? }.
// No password is set by the super admin: the member gets an email code and
// creates their OWN password. If email fails, the code is returned once so it
// can be shared manually.
router.post('/', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!isEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
    if (email === String(process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase()) {
      return res.status(400).json({ error: 'That email is reserved for the super admin' });
    }
    const exists = await AdminUser.findOne({ email });
    if (exists) return res.status(409).json({ error: 'An admin with this email already exists' });

    // Unusable random hash until they set a real password via the email code.
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const doc = await AdminUser.create({
      email,
      passwordHash,
      role: 'admin',
      accessStart: req.body.accessStart ? new Date(req.body.accessStart) : null,
      accessEnd: req.body.accessEnd ? new Date(req.body.accessEnd) : null,
      permissions: sanitizePermissions(req.body.permissions),
      isActive: true,
    });

    await PasswordToken.deleteMany({ email, purpose: 'setup', usedAt: null });
    const code = makeCode();
    await PasswordToken.create({
      email,
      codeHash: crypto.createHash('sha256').update(code).digest('hex'),
      purpose: 'setup',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    let emailSent = false;
    let emailError = null;
    try {
      const r = await sendAccessInviteEmail(email, code);
      emailSent = r.sent;
      emailError = r.error || null;
    } catch (e) { emailError = e.message; }

    const who = actorOf(req);
    logAudit({ ...who, action: 'create', entity: 'admin', entityId: String(doc._id), summary: `Invited ${email}` }).catch(() => {});
    return res.status(201).json({
      ok: true,
      admin: doc.toJSON(),
      emailSent,
      emailError,
      setupCode: emailSent ? undefined : code,
    });
  } catch (err) {
    console.error('[admins:create]', err.message);
    return res.status(500).json({ error: 'Could not create admin' });
  }
});

// PATCH /api/admins/:id — super: { accessStart, accessEnd, isActive, password?, permissions? }.
router.patch('/:id', async (req, res) => {
  try {
    const patch = {};
    if (req.body.accessStart !== undefined) {
      patch.accessStart = req.body.accessStart ? new Date(req.body.accessStart) : null;
    }
    if (req.body.accessEnd !== undefined) {
      patch.accessEnd = req.body.accessEnd ? new Date(req.body.accessEnd) : null;
    }
    if (req.body.isActive !== undefined) patch.isActive = !!req.body.isActive;
    if (req.body.permissions !== undefined) patch.permissions = sanitizePermissions(req.body.permissions);
    if (req.body.password !== undefined && req.body.password !== '') {
      if (String(req.body.password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      patch.passwordHash = await bcrypt.hash(String(req.body.password), 10);
    }
    const doc = await AdminUser.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!doc) return res.status(404).json({ error: 'Admin not found' });
    const who = actorOf(req);
    logAudit({ ...who, action: 'update', entity: 'admin', entityId: String(doc._id), summary: `Updated ${doc.email}` }).catch(() => {});
    return res.json({ ok: true, admin: doc.toJSON() });
  } catch (err) {
    console.error('[admins:patch]', err.message);
    return res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE /api/admins/:id — super: revoke access permanently.
router.delete('/:id', async (req, res) => {
  try {
    const doc = await AdminUser.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Admin not found' });
    const who = actorOf(req);
    logAudit({ ...who, action: 'delete', entity: 'admin', entityId: String(doc._id), summary: `Removed ${doc.email}` }).catch(() => {});
    return res.json({ ok: true });
  } catch (err) {
    console.error('[admins:delete]', err.message);
    return res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
