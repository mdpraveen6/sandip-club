const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Registration = require('../models/Registration');
const { requireAuth, requirePerm } = require('../middleware/auth');
const { isEmail, required } = require('../utils/validate');
const { sendApprovalEmail, sendNewRegistrationAlert } = require('../utils/mailer');
const AdminUser = require('../models/AdminUser');
const { logAudit, actorOf } = require('../utils/audit');

const router = express.Router();
const STATUSES = ['pending', 'shortlisted', 'rejected', 'accepted'];

// POST /api/registrations — public, from the Register form.
router.post('/', async (req, res) => {
  try {
    const missing = required(req.body, [
      'fullName', 'prn', 'email', 'phone', 'ideaTitle', 'problemStatement', 'solutionOverview',
    ]);
    if (missing.length) return res.status(400).json({ error: missing.join(', ') });
    if (!isEmail(req.body.email)) return res.status(400).json({ error: 'Valid email is required' });

    const doc = await Registration.create({
      fullName: String(req.body.fullName).trim(),
      prn: String(req.body.prn).trim(),
      school: String(req.body.school || '').trim(),
      academicYear: String(req.body.academicYear || '').trim(),
      gender: String(req.body.gender || '').trim(),
      email: String(req.body.email).trim().toLowerCase(),
      phone: String(req.body.phone).trim(),
      ideaTitle: String(req.body.ideaTitle).trim(),
      domain: String(req.body.domain || '').trim(),
      teamType: String(req.body.teamType || 'Solo Founder').trim(),
      problemStatement: String(req.body.problemStatement),
      solutionOverview: String(req.body.solutionOverview),
      pitchDeckUrl: String(req.body.pitchDeckUrl || '').trim(),
    });
    try {
      const viewers = await AdminUser.find({ role: 'admin', isActive: true, 'permissions.registrations.view': true }).select('email').lean();
      sendNewRegistrationAlert(doc, viewers.map((v) => v.email)).catch(() => {});
    } catch {}
    logAudit({ actor: doc.email, role: 'applicant', action: 'create', entity: 'registration', entityId: String(doc._id), summary: `${doc.fullName} — ${doc.ideaTitle}` }).catch(() => {});
    return res.status(201).json({ ok: true, registration: doc });
  } catch (err) {
    console.error('[registrations:create]', err.message);
    return res.status(500).json({ error: 'Could not save registration. Try again.' });
  }
});

// GET /api/registrations?search=&status=&page=&limit= — admin list.
router.get('/', requireAuth, requirePerm('registrations', 'view'), async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const filter = {};
    if (status && STATUSES.includes(status)) filter.status = status;
    if (search.trim()) {
      const q = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ fullName: q }, { email: q }, { prn: q }, { ideaTitle: q }];
    }
    const [items, total] = await Promise.all([
      Registration.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Registration.countDocuments(filter),
    ]);
    return res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    console.error('[registrations:list]', err.message);
    return res.status(500).json({ error: 'Could not load registrations' });
  }
});

// GET /api/registrations/export — admin CSV download. (Before /:id routes.)
router.get('/export', requireAuth, requirePerm('registrations', 'view'), async (req, res) => {
  try {
    const items = await Registration.find({}).sort({ createdAt: -1 }).lean();
    const cols = ['createdAt', 'fullName', 'prn', 'school', 'academicYear', 'gender', 'email', 'phone', 'ideaTitle', 'domain', 'teamType', 'problemStatement', 'solutionOverview', 'pitchDeckUrl', 'status', 'passRef', 'acceptedAt'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...items.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sebc-registrations.csv"');
    return res.send(csv);
  } catch (err) {
    console.error('[registrations:export]', err.message);
    return res.status(500).json({ error: 'Export failed' });
  }
});

// PATCH /api/registrations/:id — admin: { status, notes }.
router.patch('/:id', requireAuth, requirePerm('registrations', 'manage'), async (req, res) => {
  try {
    const update = {};
    if (req.body.status !== undefined) {
      if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
      update.status = req.body.status;
    }
    if (req.body.notes !== undefined) update.notes = String(req.body.notes);
    const doc = await Registration.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Registration not found' });
    const who = actorOf(req);
    logAudit({ ...who, action: 'update', entity: 'registration', entityId: String(doc._id), summary: `Set ${doc.fullName} → ${doc.status}` }).catch(() => {});
    return res.json({ ok: true, registration: doc });
  } catch (err) {
    console.error('[registrations:patch]', err.message);
    return res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE /api/registrations/:id — admin.
router.delete('/:id', requireAuth, requirePerm('registrations', 'remove'), async (req, res) => {
  try {
    const doc = await Registration.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Registration not found' });
    const who = actorOf(req);
    logAudit({ ...who, action: 'delete', entity: 'registration', entityId: String(doc._id), summary: `Deleted ${doc.fullName} — ${doc.ideaTitle}` }).catch(() => {});
    return res.json({ ok: true });
  } catch (err) {
    console.error('[registrations:delete]', err.message);
    return res.status(500).json({ error: 'Delete failed' });
  }
});

// ---- Deck upload (public: used by the Register form before submit) ----
const deckDir = path.join(__dirname, '..', '..', 'uploads', 'decks');
if (!fs.existsSync(deckDir)) fs.mkdirSync(deckDir, { recursive: true });
const deckUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, deckDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const okExt = /\.(pdf|ppt|pptx|doc|docx)$/i.test(file.originalname || '');
    const okMime = /pdf|presentation|msword|officedocument/.test(file.mimetype || '');
    if (okExt || okMime) cb(null, true);
    else cb(new Error('Only PDF / PPT / DOC files allowed (max 15MB)'));
  },
});

// POST /api/registrations/upload-deck — public, returns { url } for pitchDeckUrl.
router.post('/upload-deck', (req, res) => {
  deckUpload.single('deck')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file attached (field name: deck)' });
    return res.json({ ok: true, url: `/uploads/decks/${req.file.filename}` });
  });
});

async function mintRef() {
  for (let i = 0; i < 10; i++) {
    const ref = 'SEBC-2026-' + Math.floor(10000 + Math.random() * 90000);
    // eslint-disable-next-line no-await-in-loop
    const exists = await Registration.findOne({ passRef: ref }).lean();
    if (!exists) return ref;
  }
  return 'SEBC-2026-' + Date.now().toString().slice(-5);
}

// POST /api/registrations/:id/accept — admin: approve, issue pass ref, email it.
router.post('/:id/accept', requireAuth, requirePerm('registrations', 'manage'), async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    if (reg.status === 'accepted' && reg.passRef) {
      return res.status(400).json({ error: 'Already accepted — use Resend mail to send the pass again' });
    }
    reg.status = 'accepted';
    reg.passRef = await mintRef();
    reg.acceptedAt = new Date();
    await reg.save();
    let emailSent = false;
    let emailError = null;
    try {
      const r = await sendApprovalEmail(reg);
      emailSent = r.sent;
      emailError = r.error || null;
    } catch (e) { emailError = e.message; }
    const who = actorOf(req);
    logAudit({ ...who, action: 'accept', entity: 'registration', entityId: String(reg._id), summary: `Accepted ${reg.fullName}, pass ${reg.passRef}, mail ${emailSent ? 'sent' : 'failed'}` }).catch(() => {});
    return res.json({ ok: true, registration: reg, emailSent, emailError });
  } catch (err) {
    console.error('[registrations:accept]', err.message);
    return res.status(500).json({ error: 'Accept failed' });
  }
});

// POST /api/registrations/:id/resend — admin: re-send the approval email.
router.post('/:id/resend', requireAuth, requirePerm('registrations', 'manage'), async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    if (reg.status !== 'accepted' || !reg.passRef) {
      return res.status(400).json({ error: 'Accept the application first' });
    }
    let emailSent = false;
    let emailError = null;
    try {
      const r = await sendApprovalEmail(reg);
      emailSent = r.sent;
      emailError = r.error || null;
    } catch (e) { emailError = e.message; }
    const who = actorOf(req);
    logAudit({ ...who, action: 'resend', entity: 'registration', entityId: String(reg._id), summary: `Resent pass mail to ${reg.email} (${emailSent ? 'sent' : 'failed'})` }).catch(() => {});
    return res.json({ ok: true, emailSent, emailError });
  } catch (err) {
    console.error('[registrations:resend]', err.message);
    return res.status(500).json({ error: 'Resend failed' });
  }
});

// GET /api/registrations/pending-team — admin: accepted but not yet on the Team page.
router.get('/pending-team', requireAuth, requirePerm('registrations', 'view'), async (req, res) => {
  try {
    const items = await Registration.find({ status: 'accepted', addedToTeam: { $ne: true } })
      .sort({ acceptedAt: -1 })
      .lean();
    return res.json({ items, total: items.length });
  } catch (err) {
    console.error('[registrations:pending-team]', err.message);
    return res.status(500).json({ error: 'Could not load pending list' });
  }
});

module.exports = router;
