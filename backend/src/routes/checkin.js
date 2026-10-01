const express = require('express');
const crypto = require('crypto');
const Registration = require('../models/Registration');
const Counter = require('../models/Counter');
const { requireAuth } = require('../middleware/auth');
const { requireDb } = require('../config/db');

const router = express.Router();

function norm(s) {
  return String(s || '').trim().replace(/\s+/g, ' ');
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exactInsensitive(s) {
  return new RegExp(`^${escapeRegExp(s)}$`, 'i');
}

// Eligible for event: everything except rejected.
const ELIGIBLE_STATUSES = ['pending', 'shortlisted', 'accepted'];

// Find eligible registration matching idea + leader (tolerant: trim + case-insensitive).
async function findMatch(ideaTitle, leaderName) {
  const idea = norm(ideaTitle);
  const leader = norm(leaderName);
  if (!idea || !leader) return null;
  // Exact case-insensitive match on both fields. No substring/loose matching.
  const candidates = await Registration.find({
    ideaTitle: exactInsensitive(idea),
    fullName: exactInsensitive(leader),
    status: { $in: ELIGIBLE_STATUSES },
  }).lean();
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    // Prefer checked-in one, else earliest
    const checked = candidates.find((c) => c.teamNumber != null);
    return checked || candidates.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
  }
  return null;
}

async function nextTeamNumber() {
  const doc = await Counter.findOneAndUpdate(
    { _id: 'teamNumber' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return doc.seq;
}

function publicTeamPayload(reg) {
  return {
    teamNumber: reg.teamNumber,
    ideaTitle: reg.ideaTitle,
    leaderName: reg.fullName,
    checkedInAt: reg.checkedInAt,
  };
}

// POST /api/checkin — public, Team Head only. { ideaTitle, leaderName }
router.post('/', requireDb, async (req, res) => {
  try {
    const ideaTitle = norm(req.body.ideaTitle);
    const leaderName = norm(req.body.leaderName);
    if (!ideaTitle || !leaderName) {
      return res.status(400).json({ error: 'Idea & deck name and Founder name are required' });
    }
    const match = await findMatch(ideaTitle, leaderName);
    if (!match) {
      return res.status(404).json({ error: 'No matching registration found. Check Idea & deck name and Founder spelling.' });
    }
    // Idempotent duplicate: already checked in -> return same number, no new allocation.
    if (match.teamNumber != null) {
      const fresh = await Registration.findById(match._id).lean();
      return res.json({ ok: true, alreadyCheckedIn: true, ...publicTeamPayload(fresh) });
    }
    // Allocate next number atomically (server order, not device time).
    const seq = await nextTeamNumber();
    const updated = await Registration.findOneAndUpdate(
      { _id: match._id, $or: [{ teamNumber: null }, { teamNumber: { $exists: false } }] },
      { $set: { teamNumber: seq, checkedInAt: new Date(), checkinStatus: 'checked-in' } },
      { new: true }
    ).lean();
    if (updated) {
      return res.status(201).json({ ok: true, alreadyCheckedIn: false, ...publicTeamPayload(updated) });
    }
    // Lost race on same doc (duplicate concurrent submit) -> return winner's number.
    const winner = await Registration.findById(match._id).lean();
    return res.json({ ok: true, alreadyCheckedIn: true, ...publicTeamPayload(winner) });
  } catch (err) {
    // Unique-index race between different teams is impossible (Counter is atomic),
    // but handle duplicate-key defensively.
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'Check-in conflict, please try again' });
    }
    console.error('[checkin:create]', err.message);
    return res.status(500).json({ error: 'Check-in failed. Try again.' });
  }
});

// GET /api/checkin/lookup — public, minimal autocomplete data only.
// Returns [{ ideaTitle, founderName }] for eligible (pending/shortlisted/accepted) registrations.
// No emails, phones, or other sensitive fields.
router.get('/lookup', requireDb, async (req, res) => {
  try {
    const items = await Registration.find({ status: { $in: ELIGIBLE_STATUSES } })
      .select('ideaTitle fullName')
      .sort({ ideaTitle: 1 })
      .limit(500)
      .lean();
    return res.json({
      items: items.map((r) => ({ ideaTitle: r.ideaTitle, founderName: r.fullName })),
    });
  } catch (err) {
    console.error('[checkin:lookup]', err.message);
    return res.status(500).json({ error: 'Could not load lookup' });
  }
});

// ---- Admin (uses existing admin auth; any authenticated admin) ----

// GET /api/checkin/admin/status — counts + next number
router.get('/admin/status', requireDb, requireAuth, async (req, res) => {
  try {
    const [total, checkedIn] = await Promise.all([
      Registration.countDocuments({ status: { $in: ELIGIBLE_STATUSES } }),
      Registration.countDocuments({ status: { $in: ELIGIBLE_STATUSES }, teamNumber: { $ne: null } }),
    ]);
    const counter = await Counter.findById('teamNumber').lean();
    return res.json({
      totalRegistered: total,
      checkedIn,
      notCheckedIn: total - checkedIn,
      nextTeamNumber: (counter ? counter.seq : 0) + 1,
    });
  } catch (err) {
    console.error('[checkin:status]', err.message);
    return res.status(500).json({ error: 'Could not load check-in status' });
  }
});

// GET /api/checkin/admin/teams — checked-in first (by teamNumber), then pending
router.get('/admin/teams', requireDb, requireAuth, async (req, res) => {
  try {
    const items = await Registration.find({ status: { $in: ELIGIBLE_STATUSES } })
      .select('ideaTitle fullName teamNumber checkedInAt checkinStatus createdAt')
      .lean();
    const checked = items
      .filter((r) => r.teamNumber != null)
      .sort((a, b) => a.teamNumber - b.teamNumber);
    const pending = items
      .filter((r) => r.teamNumber == null)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return res.json({ checkedIn: checked, pending, total: items.length });
  } catch (err) {
    console.error('[checkin:teams]', err.message);
    return res.status(500).json({ error: 'Could not load teams' });
  }
});

module.exports = router;
