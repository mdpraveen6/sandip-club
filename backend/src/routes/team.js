const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const TeamMember = require('../models/TeamMember');
const Registration = require('../models/Registration');
const { requireAuth, requirePerm } = require('../middleware/auth');
const { required } = require('../utils/validate');
const { logAudit, actorOf } = require('../utils/audit');

const router = express.Router();

const { isCloudinaryEnabled, uploadBuffer } = require('../config/cloudinary');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = isCloudinaryEnabled()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WebP or GIF photos allowed'));
  },
});

function parseTags(v) {
  if (Array.isArray(v)) return v.map((t) => String(t).trim()).filter(Boolean).slice(0, 12);
  if (typeof v === 'string') {
    return v.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12);
  }
  return [];
}

function parseSocials(v) {
  if (typeof v === 'string') {
    try { v = JSON.parse(v); } catch { return []; }
  }
  if (!Array.isArray(v)) return [];
  return v
    .filter((s) => s && (s.url || s.label))
    .slice(0, 8)
    .map((s) => ({ label: String(s.label || '').trim().slice(0, 40), url: String(s.url || '').trim().slice(0, 500) }))
    .filter((s) => s.url);
}

// GET /api/team — public roster for the Team page.
router.get('/', async (req, res) => {
  try {
    const items = await TeamMember.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
    return res.json({ items });
  } catch (err) {
    console.error('[team:list]', err.message);
    return res.status(500).json({ error: 'Could not load team' });
  }
});

// GET /api/team/all — admin: everything including hidden.
router.get('/all', requireAuth, requirePerm('team', 'view'), async (req, res) => {
  try {
    const items = await TeamMember.find({}).sort({ order: 1, name: 1 }).lean();
    return res.json({ items });
  } catch (err) {
    console.error('[team:all]', err.message);
    return res.status(500).json({ error: 'Could not load team' });
  }
});

// POST /api/team — admin create (photoUrl or uploaded photo).
router.post('/', requireAuth, requirePerm('team', 'manage'), async (req, res) => {
  try {
    const missing = required(req.body, ['name', 'role', 'category']);
    if (missing.length) return res.status(400).json({ error: missing.join(', ') });
    const doc = await TeamMember.create({
      name: String(req.body.name).trim(),
      role: String(req.body.role).trim(),
      category: String(req.body.category).trim(),
      year: String(req.body.year || '').trim(),
      branch: String(req.body.branch || '').trim(),
      bio: String(req.body.bio || ''),
      photoUrl: String(req.body.photoUrl || '').trim(),
      tags: parseTags(req.body.tags),
      socials: parseSocials(req.body.socials),
      order: parseInt(req.body.order, 10) || 0,
      isActive: req.body.isActive !== false,
      sourceRegistrationId: req.body.sourceRegistrationId || null,
    });
    if (req.body.sourceRegistrationId) {
      try {
        await Registration.findByIdAndUpdate(req.body.sourceRegistrationId, { addedToTeam: true });
      } catch { /* non-fatal: member is still created */ }
    }
    const who = actorOf(req);
    logAudit({ ...who, action: 'create', entity: 'team', entityId: String(doc._id), summary: `Added ${doc.name} (${doc.role})` }).catch(() => {});
    return res.status(201).json({ ok: true, member: doc });
  } catch (err) {
    console.error('[team:create]', err.message);
    return res.status(500).json({ error: 'Could not add member' });
  }
});

// PUT /api/team/:id — admin edit.
router.put('/:id', requireAuth, requirePerm('team', 'manage'), async (req, res) => {
  try {
    const patch = {};
    for (const k of ['name', 'role', 'category', 'year', 'branch', 'bio', 'photoUrl']) {
      if (req.body[k] !== undefined) patch[k] = String(req.body[k]);
    }
    if (req.body.tags !== undefined) patch.tags = parseTags(req.body.tags);
    if (req.body.socials !== undefined) patch.socials = parseSocials(req.body.socials);
    if (req.body.order !== undefined) patch.order = parseInt(req.body.order, 10) || 0;
    if (req.body.isActive !== undefined) patch.isActive = !!req.body.isActive;
    const doc = await TeamMember.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Member not found' });
    const who = actorOf(req);
    logAudit({ ...who, action: 'update', entity: 'team', entityId: String(doc._id), summary: `Updated ${doc.name}` }).catch(() => {});
    return res.json({ ok: true, member: doc });
  } catch (err) {
    console.error('[team:update]', err.message);
    return res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE /api/team/:id — admin.
router.delete('/:id', requireAuth, requirePerm('team', 'remove'), async (req, res) => {
  try {
    const doc = await TeamMember.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Member not found' });
    const who = actorOf(req);
    logAudit({ ...who, action: 'delete', entity: 'team', entityId: String(doc._id), summary: `Removed ${doc.name}` }).catch(() => {});
    return res.json({ ok: true });
  } catch (err) {
    console.error('[team:delete]', err.message);
    return res.status(500).json({ error: 'Delete failed' });
  }
});

// POST /api/team/upload — admin photo upload, returns { url }.
router.post('/upload', requireAuth, requirePerm('team', 'manage'), (req, res) => {
  upload.single('photo')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No photo attached (field name: photo)' });
    try {
      if (isCloudinaryEnabled()) {
        const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
        const base = path.basename(req.file.originalname, path.extname(req.file.originalname))
          .replace(/[^a-zA-Z0-9-_]+/g, '-').slice(0, 60) || 'photo';
        const result = await uploadBuffer(req.file.buffer, {
          folder: 'sebc/team',
          resourceType: 'image',
          filename: `${Date.now()}-${Math.round(Math.random() * 1e6)}-${base}${ext}`,
        });
        return res.json({ ok: true, url: result.secure_url });
      }
      return res.json({ ok: true, url: `/uploads/${req.file.filename}` });
    } catch (e) {
      console.error('[photo:cloudinary]', e.message);
      return res.status(500).json({ error: 'Photo upload failed. Try again.' });
    }
  });
});

module.exports = router;
