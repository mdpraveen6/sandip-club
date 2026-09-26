const express = require('express');
const AuditLog = require('../models/AuditLog');
const { requireAuth, requireSuper } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireSuper);

// GET /api/audit?actor=&entity=&action=&page=&limit= — super: full activity trail.
router.get('/', async (req, res) => {
  try {
    const { actor = '', entity = '', action = '' } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const filter = {};
    if (actor.trim()) {
      filter.actor = new RegExp(actor.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    if (entity) filter.entity = entity;
    if (action) filter.action = action;
    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);
    return res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    console.error('[audit:list]', err.message);
    return res.status(500).json({ error: 'Could not load activity' });
  }
});

module.exports = router;
