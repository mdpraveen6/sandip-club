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
const { requireDb } = require('../config/db');

const router = express.Router();
const STATUSES = ['pending', 'shortlisted', 'rejected', 'accepted'];

// POST /api/registrations — public, from the Register form.
router.post('/', requireDb, async (req, res) => {
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
    (async () => {
      try {
        const viewers = await AdminUser.find({ role: 'admin', isActive: true, 'permissions.registrations.view': true }).select('email').lean();
        const r = await sendNewRegistrationAlert(doc, viewers.map((v) => v.email));
        if (r.sent) console.log(`[mail] registration alert sent (${doc.email})`);
        else console.warn(`[mail] registration alert skipped: ${r.error}`);
      } catch (e) { console.warn('[mail] registration alert failed:', e.message); }
    })();
    logAudit({ actor: doc.email, role: 'applicant', action: 'create', entity: 'registration', entityId: String(doc._id), summary: `${doc.fullName} — ${doc.ideaTitle}` }).catch(() => {});
    return res.status(201).json({ ok: true, registration: doc });
  } catch (err) {
    console.error('[registrations:create]', err.message);
    return res.status(500).json({ error: 'Could not save registration. Try again.' });
  }
});

// GET /api/registrations?search=&status=&page=&limit= — admin list.
router.get('/', requireDb, requireAuth, requirePerm('registrations', 'view'), async (req, res) => {
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
router.get('/export', requireDb, requireAuth, requirePerm('registrations', 'view'), async (req, res) => {
  try {
    const { ids = '' } = req.query;
    const filter = {};
    if (ids.trim()) {
      const list = String(ids).split(',').map((s) => s.trim()).filter(Boolean);
      if (list.length) filter._id = { $in: list };
    }
    const items = await Registration.find(filter).sort({ createdAt: -1 }).lean();
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

// ---- Excel import (flexible headers + upsert by email) ----
const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const name = file.originalname || '';
    const okExt = /\.(xlsx|xls|csv)$/i.test(name);
    if (okExt) cb(null, true);
    else cb(new Error('Only .xlsx / .xls / .csv files allowed (max 5MB)'));
  },
});

const DB_FIELDS = ['fullName', 'prn', 'school', 'academicYear', 'gender', 'email', 'phone', 'ideaTitle', 'domain', 'teamType', 'problemStatement', 'solutionOverview', 'pitchDeckUrl', 'status', 'notes'];
const HEADER_ALIASES = {
  fullname: 'fullName', name: 'fullName', studentname: 'fullName', candidatename: 'fullName',
  foundername: 'fullName', applicantname: 'fullName', applicant: 'fullName', candidate: 'fullName',
  prn: 'prn', prnno: 'prn', prnnumber: 'prn', rollno: 'prn', rollnumber: 'prn', idnumber: 'prn', prnnum: 'prn',
  school: 'school', college: 'school', institute: 'school', branch: 'school', department: 'school',
  dept: 'school', organization: 'school', organisation: 'school',
  academicyear: 'academicYear', year: 'academicYear', class: 'academicYear', academicyr: 'academicYear',
  studyyear: 'academicYear', currentyear: 'academicYear',
  gender: 'gender', sex: 'gender',
  email: 'email', emailid: 'email', mail: 'email', emailaddress: 'email', emailidaddress: 'email',
  phone: 'phone', phonenumber: 'phone', mobile: 'phone', mobilenumber: 'phone', contact: 'phone',
  contactnumber: 'phone', phoneno: 'phone', mobileno: 'phone', contactno: 'phone',
  ideatitle: 'ideaTitle', idea: 'ideaTitle', projecttitle: 'ideaTitle', title: 'ideaTitle',
  startupidea: 'ideaTitle', ideaname: 'ideaTitle', projectname: 'ideaTitle',
  domain: 'domain', theme: 'domain', category: 'domain', track: 'domain', sector: 'domain',
  teamtype: 'teamType', team: 'teamType', teamkind: 'teamType', participationtype: 'teamType',
  problemstatement: 'problemStatement', problem: 'problemStatement', problemdesc: 'problemStatement',
  issue: 'problemStatement', challenge: 'problemStatement', problemdescription: 'problemStatement',
  solutionoverview: 'solutionOverview', solution: 'solutionOverview', solutionsummary: 'solutionOverview',
  overview: 'solutionOverview', proposal: 'solutionOverview', solutiondescription: 'solutionOverview',
  pitchdeckurl: 'pitchDeckUrl', deck: 'pitchDeckUrl', deckurl: 'pitchDeckUrl', pitchdeck: 'pitchDeckUrl',
  ppt: 'pitchDeckUrl', presentation: 'pitchDeckUrl', document: 'pitchDeckUrl', file: 'pitchDeckUrl', link: 'pitchDeckUrl',
  status: 'status', applicationstatus: 'status',
  notes: 'notes', remark: 'notes', remarks: 'notes', adminnotes: 'notes', comments: 'notes', comment: 'notes',
};

function normalizeHeader(h) {
  return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
function suggestMapping(headers) {
  const mapping = {};
  const used = new Set();
  headers.forEach((h) => {
    const n = normalizeHeader(h);
    const db = HEADER_ALIASES[n] || (DB_FIELDS.includes(n) ? n : '');
    if (db && !used.has(db)) { mapping[h] = db; used.add(db); }
    else mapping[h] = '';
  });
  return mapping;
}
function parseExcelBuffer(buffer) {
  const XLSX = require('xlsx');
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const wsName = wb.SheetNames[0];
  if (!wsName) throw new Error('No sheets found in file');
  const ws = wb.Sheets[wsName];
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
  if (!aoa.length) throw new Error('Sheet is empty');
  const headers = aoa[0].map((h) => String(h || '').trim()).filter((h) => h !== '');
  if (!headers.length) throw new Error('Header row not found (first row is empty)');
  const rows = aoa.slice(1)
    .filter((r) => r.some((c) => String(c ?? '').trim() !== ''))
    .slice(0, 1000)
    .map((r) => {
      const o = {};
      headers.forEach((h, i) => { o[h] = String(r[i] ?? '').trim(); });
      return o;
    });
  return { headers, rows, totalRows: rows.length };
}

// POST /api/registrations/import-preview — admin: upload .xlsx, get headers + suggested mapping.
router.post('/import-preview', requireDb, requireAuth, requirePerm('registrations', 'manage'), (req, res) => {
  excelUpload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file attached (field name: file)' });
    try {
      const { headers, rows, totalRows } = parseExcelBuffer(req.file.buffer);
      return res.json({
        ok: true, headers, suggestedMapping: suggestMapping(headers),
        preview: rows.slice(0, 5), rows, totalRows, dbFields: DB_FIELDS,
      });
    } catch (e) {
      console.error('[registrations:import-preview]', e.message);
      return res.status(400).json({ error: e.message || 'Could not parse Excel file' });
    }
  });
});

// POST /api/registrations/import — ADMIN ONLY (Excel). Relaxed on purpose:
// - Existing email (case-insensitive): partial update, missing cells keep DB values, never error.
// - New email: only `email` is required; all other portal-required fields fall back
//   to IMPORTED defaults so a missing PRN/phone/problem/solution column never blocks.
// Portal route POST /api/registrations above stays strict for students.
router.post('/import', requireDb, requireAuth, requirePerm('registrations', 'manage'), async (req, res) => {
  try {
    const { rows = [], mapping = {} } = req.body || {};
    if (!Array.isArray(rows) || !rows.length) return res.status(400).json({ error: 'No rows to import' });
    if (rows.length > 1000) return res.status(400).json({ error: 'Max 1000 rows per import' });
    const UPDATABLE = ['fullName', 'prn', 'school', 'academicYear', 'gender', 'phone', 'ideaTitle', 'domain', 'teamType', 'problemStatement', 'solutionOverview', 'pitchDeckUrl', 'status', 'notes'];
    let created = 0; let updated = 0; let skipped = 0;
    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i] || {};
      const doc = {};
      Object.keys(mapping).forEach((excelCol) => {
        const db = mapping[excelCol];
        if (!db || !DB_FIELDS.includes(db)) return;
        const v = String(raw[excelCol] ?? '').trim();
        if (v !== '') doc[db] = v;
      });
      const rowNum = i + 2;
      // Fully blank row -> skip silently, not an error.
      if (!doc.email && !Object.keys(doc).length) { skipped++; continue; }
      if (!doc.email || !isEmail(doc.email)) { errors.push({ row: rowNum, email: doc.email || '', reason: 'Valid email is required (used to match existing)' }); continue; }
      doc.email = doc.email.toLowerCase();
      if (doc.status && !STATUSES.includes(String(doc.status).toLowerCase())) delete doc.status;
      else if (doc.status) doc.status = String(doc.status).toLowerCase();
      try {
        const existing = await Registration.findOne({ email: doc.email });
        if (existing) {
          let changed = false;
          UPDATABLE.forEach((f) => {
            if (doc[f] !== undefined && String(doc[f]).trim() !== '') { existing[f] = doc[f]; changed = true; }
          });
          if (doc.status) { existing.status = doc.status; changed = true; }
          if (changed) { await existing.save(); updated++; }
          else skipped++; // already up to date -> keep existing data, not an error
        } else {
          const emailPrefix = doc.email.split('@')[0] || 'Imported Founder';
          await Registration.create({
            fullName: doc.fullName || emailPrefix,
            prn: doc.prn || 'IMPORTED',
            email: doc.email,
            phone: doc.phone || 'IMPORTED',
            ideaTitle: doc.ideaTitle || 'Imported Idea',
            problemStatement: doc.problemStatement || 'Imported via Excel',
            solutionOverview: doc.solutionOverview || 'Imported via Excel',
            school: doc.school || '', academicYear: doc.academicYear || '', gender: doc.gender || '',
            domain: doc.domain || '', teamType: doc.teamType || 'Solo Founder',
            pitchDeckUrl: doc.pitchDeckUrl || '', status: doc.status || 'pending', notes: doc.notes || '',
          });
          created++;
        }
      } catch (e) { errors.push({ row: rowNum, email: doc.email || '', reason: e.message }); }
    }
    const who = actorOf(req);
    logAudit({ ...who, action: 'import', entity: 'registration', entityId: '', summary: `Excel import: ${created} created, ${updated} updated, ${skipped + errors.length} skipped` }).catch(() => {});
    return res.json({ ok: true, created, updated, skipped: skipped + errors.length, errors: errors.slice(0, 50) });
  } catch (err) {
    console.error('[registrations:import]', err.message);
    return res.status(500).json({ error: 'Import failed' });
  }
});

// PATCH /api/registrations/bulk-status — admin: { ids: [], status }.
router.patch('/bulk-status', requireDb, requireAuth, requirePerm('registrations', 'manage'), async (req, res) => {
  try {
    const { ids = [], status = '' } = req.body || {};
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No registrations selected' });
    if (ids.length > 200) return res.status(400).json({ error: 'Max 200 at a time' });
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const r = await Registration.updateMany({ _id: { $in: ids } }, { $set: { status } });
    const who = actorOf(req);
    logAudit({ ...who, action: 'update', entity: 'registration', entityId: '', summary: `Bulk status → ${status} (${r.modifiedCount} items)` }).catch(() => {});
    return res.json({ ok: true, modified: r.modifiedCount });
  } catch (err) {
    console.error('[registrations:bulk-status]', err.message);
    return res.status(500).json({ error: 'Bulk update failed' });
  }
});

// POST /api/registrations/bulk-delete — admin: { ids: [] }.
router.post('/bulk-delete', requireDb, requireAuth, requirePerm('registrations', 'remove'), async (req, res) => {
  try {
    const { ids = [] } = req.body || {};
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No registrations selected' });
    if (ids.length > 200) return res.status(400).json({ error: 'Max 200 at a time' });
    const r = await Registration.deleteMany({ _id: { $in: ids } });
    const who = actorOf(req);
    logAudit({ ...who, action: 'delete', entity: 'registration', entityId: '', summary: `Bulk delete (${r.deletedCount} items)` }).catch(() => {});
    return res.json({ ok: true, deleted: r.deletedCount });
  } catch (err) {
    console.error('[registrations:bulk-delete]', err.message);
    return res.status(500).json({ error: 'Bulk delete failed' });
  }
});

// PATCH /api/registrations/:id — admin full edit (all fields, incl. pitchDeckUrl add/remove).
router.patch('/:id', requireDb, requireAuth, requirePerm('registrations', 'manage'), async (req, res) => {
  try {
    const update = {};
    const text = (v) => String(v ?? '').trim();
    const FIELDS = ['fullName', 'prn', 'school', 'academicYear', 'gender', 'phone', 'ideaTitle', 'domain', 'teamType', 'problemStatement', 'solutionOverview', 'pitchDeckUrl', 'notes'];
    FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) update[f] = text(req.body[f]);
    });
    if (req.body.email !== undefined) {
      const em = text(req.body.email).toLowerCase();
      if (!isEmail(em)) return res.status(400).json({ error: 'Valid email is required' });
      const clash = await Registration.findOne({ email: em, _id: { $ne: req.params.id } }).lean();
      if (clash) return res.status(400).json({ error: 'Another registration already uses this email' });
      update.email = em;
    }
    if (req.body.status !== undefined) {
      if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
      update.status = req.body.status;
    }
    // Required fields must not be blanked out.
    for (const f of ['fullName', 'prn', 'phone', 'ideaTitle', 'problemStatement', 'solutionOverview']) {
      if (update[f] !== undefined && !update[f]) return res.status(400).json({ error: `${f} cannot be empty` });
    }
    const doc = await Registration.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Registration not found' });
    const who = actorOf(req);
    logAudit({ ...who, action: 'update', entity: 'registration', entityId: String(doc._id), summary: `Edited ${doc.fullName} (${Object.keys(update).join(',')})` }).catch(() => {});
    return res.json({ ok: true, registration: doc });
  } catch (err) {
    console.error('[registrations:patch]', err.message);
    return res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE /api/registrations/:id — admin.
router.delete('/:id', requireDb, requireAuth, requirePerm('registrations', 'remove'), async (req, res) => {
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
// Cloudinary (persistent) when env vars are set, local disk fallback for dev.
const { isCloudinaryEnabled, uploadBuffer } = require('../config/cloudinary');

const deckDir = path.join(__dirname, '..', '..', 'uploads', 'decks');
if (!fs.existsSync(deckDir)) fs.mkdirSync(deckDir, { recursive: true });
const deckUpload = multer({
  storage: isCloudinaryEnabled()
    ? multer.memoryStorage()
    : multer.diskStorage({
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
  deckUpload.single('deck')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file attached (field name: deck)' });
    try {
      if (isCloudinaryEnabled()) {
        const ext = path.extname(req.file.originalname).toLowerCase() || '.pdf';
        const base = path.basename(req.file.originalname, path.extname(req.file.originalname))
          .replace(/[^a-zA-Z0-9-_]+/g, '-').slice(0, 60) || 'deck';
        // PDFs as image-type for public delivery + iframe preview.
        // ppt/doc must stay raw (no preview, download only).
        const resourceType = ext === '.pdf' ? 'image' : 'raw';
        const result = await uploadBuffer(req.file.buffer, {
          folder: 'sebc/decks',
          resourceType,
          filename: `${Date.now()}-${Math.round(Math.random() * 1e6)}-${base}${ext}`,
        });
        return res.json({ ok: true, url: result.secure_url });
      }
      return res.json({ ok: true, url: `/uploads/decks/${req.file.filename}` });
    } catch (e) {
      console.error('[deck:cloudinary]', e.message);
      return res.status(500).json({ error: 'Deck upload failed. Try again.' });
    }
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
router.post('/:id/accept', requireDb, requireAuth, requirePerm('registrations', 'manage'), async (req, res) => {
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
router.post('/:id/resend', requireDb, requireAuth, requirePerm('registrations', 'manage'), async (req, res) => {
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
router.get('/pending-team', requireDb, requireAuth, requirePerm('registrations', 'view'), async (req, res) => {
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
