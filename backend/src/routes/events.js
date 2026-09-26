const express = require('express');
const Event = require('../models/Event');
const Rsvp = require('../models/Rsvp');
const { requireAuth, requirePerm } = require('../middleware/auth');
const { isEmail, required } = require('../utils/validate');
const { logAudit, actorOf } = require('../utils/audit');

const router = express.Router();
const STATUSES = ['upcoming', 'ongoing', 'completed'];

async function withSeats(ev) {
  const o = ev.toObject();
  const taken = await Rsvp.countDocuments({ eventId: ev._id });
  o.seatsTaken = taken;
  o.seatsLeft = ev.maxSeats ? Math.max(0, ev.maxSeats - taken) : null;
  return o;
}

// GET /api/events?status=upcoming — public feed for the Events page.
router.get('/', async (req, res) => {
  try {
    const filter = { isPublished: true };
    if (req.query.status && STATUSES.includes(req.query.status)) filter.status = req.query.status;
    const events = await Event.find(filter).sort({ order: 1, eventDate: 1, createdAt: -1 }).lean();
    const withCounts = await Promise.all(
      events.map(async (e) => {
        const taken = await Rsvp.countDocuments({ eventId: e._id });
        return { ...e, seatsTaken: taken, seatsLeft: e.maxSeats ? Math.max(0, e.maxSeats - taken) : null };
      })
    );
    return res.json({ items: withCounts });
  } catch (err) {
    console.error('[events:list]', err.message);
    return res.status(500).json({ error: 'Could not load events' });
  }
});

// GET /api/events/all — admin: everything including drafts, with seat counts.
router.get('/all', requireAuth, requirePerm('events', 'view'), async (req, res) => {
  try {
    const events = await Event.find({}).sort({ order: 1, createdAt: -1 });
    return res.json({ items: await Promise.all(events.map(withSeats)) });
  } catch (err) {
    console.error('[events:all]', err.message);
    return res.status(500).json({ error: 'Could not load events' });
  }
});

// POST /api/events — admin create.
router.post('/', requireAuth, requirePerm('events', 'manage'), async (req, res) => {
  try {
    const missing = required(req.body, ['title', 'category', 'description']);
    if (missing.length) return res.status(400).json({ error: missing.join(', ') });
    if (req.body.status && !STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
    const doc = await Event.create({
      title: String(req.body.title).trim(),
      edition: String(req.body.edition || '').trim(),
      category: String(req.body.category).trim(),
      description: String(req.body.description),
      venue: String(req.body.venue || '').trim(),
      timeLabel: String(req.body.timeLabel || '').trim(),
      eventDate: req.body.eventDate ? new Date(req.body.eventDate) : null,
      status: req.body.status || 'upcoming',
      maxSeats: req.body.maxSeats === null || req.body.maxSeats === '' || req.body.maxSeats === undefined
        ? null
        : Math.max(1, parseInt(req.body.maxSeats, 10) || 0) || null,
      imageUrl: String(req.body.imageUrl || '').trim(),
      isPublished: req.body.isPublished !== false,
      order: parseInt(req.body.order, 10) || 0,
    });
    const who = actorOf(req);
    logAudit({ ...who, action: 'create', entity: 'event', entityId: String(doc._id), summary: `Created ${doc.title}` }).catch(() => {});
    return res.status(201).json({ ok: true, event: await withSeats(doc) });
  } catch (err) {
    console.error('[events:create]', err.message);
    return res.status(500).json({ error: 'Could not create event' });
  }
});

// PUT /api/events/:id — admin full edit.
router.put('/:id', requireAuth, requirePerm('events', 'manage'), async (req, res) => {
  try {
    if (req.body.status && !STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
    const patch = {};
    for (const k of ['title', 'edition', 'category', 'description', 'venue', 'timeLabel', 'imageUrl']) {
      if (req.body[k] !== undefined) patch[k] = String(req.body[k]);
    }
    if (req.body.status !== undefined) patch.status = req.body.status;
    if (req.body.eventDate !== undefined) patch.eventDate = req.body.eventDate ? new Date(req.body.eventDate) : null;
    if (req.body.maxSeats !== undefined) {
      patch.maxSeats = req.body.maxSeats === null || req.body.maxSeats === ''
        ? null
        : Math.max(1, parseInt(req.body.maxSeats, 10) || 0) || null;
    }
    if (req.body.isPublished !== undefined) patch.isPublished = !!req.body.isPublished;
    if (req.body.order !== undefined) patch.order = parseInt(req.body.order, 10) || 0;
    const doc = await Event.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Event not found' });
    const who = actorOf(req);
    logAudit({ ...who, action: 'update', entity: 'event', entityId: String(doc._id), summary: `Updated ${doc.title}` }).catch(() => {});
    return res.json({ ok: true, event: await withSeats(doc) });
  } catch (err) {
    console.error('[events:update]', err.message);
    return res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE /api/events/:id — admin (also removes its RSVPs).
router.delete('/:id', requireAuth, requirePerm('events', 'remove'), async (req, res) => {
  try {
    const doc = await Event.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Event not found' });
    await Rsvp.deleteMany({ eventId: doc._id });
    const who = actorOf(req);
    logAudit({ ...who, action: 'delete', entity: 'event', entityId: String(doc._id), summary: `Deleted ${doc.title}` }).catch(() => {});
    return res.json({ ok: true });
  } catch (err) {
    console.error('[events:delete]', err.message);
    return res.status(500).json({ error: 'Delete failed' });
  }
});

// POST /api/events/:id/rsvp — public. Enforces published/completed/cap/duplicates.
router.post('/:id/rsvp', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!isEmail(email)) return res.status(400).json({ error: 'Valid email is required' });

    const ev = await Event.findById(req.params.id);
    if (!ev || !ev.isPublished) return res.status(404).json({ error: 'Event not found' });
    if (ev.status === 'completed') return res.status(400).json({ error: 'Registrations closed — event completed' });

    const taken = await Rsvp.countDocuments({ eventId: ev._id });
    if (ev.maxSeats && taken >= ev.maxSeats) {
      return res.status(409).json({ error: `Registrations full (${ev.maxSeats} seats)` });
    }
    const dup = await Rsvp.findOne({ eventId: ev._id, email });
    if (dup) return res.status(409).json({ error: 'This email is already registered for the event' });

    await Rsvp.create({ eventId: ev._id, name, email });
    const seatsLeft = ev.maxSeats ? Math.max(0, ev.maxSeats - taken - 1) : null;
    logAudit({ actor: name, role: 'public site', action: 'create', entity: 'rsvp', summary: `${name} → ${ev.title}` }).catch(() => {});
    return res.status(201).json({ ok: true, seatsLeft });
  } catch (err) {
    console.error('[events:rsvp]', err.message);
    return res.status(500).json({ error: 'RSVP failed. Try again.' });
  }
});

// GET /api/events/:id/rsvps — admin: who registered.
router.get('/:id/rsvps', requireAuth, requirePerm('events', 'view'), async (req, res) => {
  try {
    const items = await Rsvp.find({ eventId: req.params.id }).sort({ createdAt: -1 }).lean();
    return res.json({ items, total: items.length });
  } catch (err) {
    console.error('[events:rsvps]', err.message);
    return res.status(500).json({ error: 'Could not load RSVPs' });
  }
});

module.exports = router;
