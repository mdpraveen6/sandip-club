const express = require('express');
const crypto = require('crypto');
const Registration = require('../models/Registration');
const Counter = require('../models/Counter');
const PresentationSession = require('../models/PresentationSession');
const Feedback = require('../models/Feedback');
const FeedbackViewer = require('../models/FeedbackViewer');
const { requireAuth } = require('../middleware/auth');
const { requireDb } = require('../config/db');
const { logAudit, actorOf } = require('../utils/audit');

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

async function smallestGap() {
  const nums = await Registration.distinct('teamNumber', { teamNumber: { $type: 'number' } });
  const used = new Set(nums.filter((n) => Number.isInteger(n) && n > 0));
  let candidate = 1;
  while (used.has(candidate)) candidate++;
  return candidate;
}

async function syncCounterFloor() {
  // Keep legacy Counter roughly in sync so old dashboards don't go backwards.
  try {
    const nums = await Registration.distinct('teamNumber', { teamNumber: { $type: 'number' } });
    const max = nums.length ? Math.max(...nums.filter((n) => Number.isInteger(n))) : 0;
    if (max > 0) await Counter.findOneAndUpdate({ _id: 'teamNumber' }, { $max: { seq: max } }, { upsert: true });
  } catch { /* non-fatal */ }
}

// Remove all QR #2 artifacts tied to a team number being freed, so after the
// shift the new occupant of that number does not inherit old feedback.
async function cleanupTeamArtifacts(registrationId, teamNumber) {
  try {
    await PresentationSession.deleteMany({ presentingRegistrationId: registrationId });
    await Feedback.deleteMany({
      $or: [
        { presentingRegistrationId: registrationId },
        { reviewerRegistrationId: registrationId },
        { teamNumber },
        { reviewerTeamNumber: teamNumber },
      ],
    });
    await FeedbackViewer.deleteMany({
      $or: [{ registrationId }, { reviewerTeamNumber: teamNumber }],
    });
  } catch (e) {
    console.error('[checkin:cleanup]', e.message);
  }
}

// Dynamic compaction: every checked-in team above `freed` shifts down by 1,
// so deleting TEAM 2 turns old TEAM 3 into TEAM 2 immediately.
// Registrations are updated ascending (gap is free, so no unique clash);
// dependent teamNumber fields shift in bulk by -1.
async function compactFrom(freed) {
  const affected = await Registration.find({ teamNumber: { $gt: freed } })
    .sort({ teamNumber: 1 })
    .select('_id teamNumber')
    .lean();
  for (const r of affected) {
    await Registration.updateOne({ _id: r._id }, { $set: { teamNumber: r.teamNumber - 1 } });
  }
  if (affected.length) {
    await PresentationSession.updateMany({ teamNumber: { $gt: freed } }, { $inc: { teamNumber: -1 } });
    await Feedback.updateMany({ teamNumber: { $gt: freed } }, { $inc: { teamNumber: -1 } });
    await Feedback.updateMany({ reviewerTeamNumber: { $gt: freed } }, { $inc: { reviewerTeamNumber: -1 } });
    await FeedbackViewer.updateMany({ reviewerTeamNumber: { $gt: freed } }, { $inc: { reviewerTeamNumber: -1 } });
  }
  try {
    const nums = await Registration.distinct('teamNumber', { teamNumber: { $type: 'number' } });
    const max = nums.length ? Math.max(...nums.filter((n) => Number.isInteger(n))) : 0;
    await Counter.findOneAndUpdate({ _id: 'teamNumber' }, { $set: { seq: max } }, { upsert: true });
  } catch { /* non-fatal */ }
  return affected.map((r) => ({ id: String(r._id), from: r.teamNumber, to: r.teamNumber - 1 }));
}

// Gap-fill allocation: smallest missing number >= 1 is reused.
// Retries on duplicate-key when two check-ins race for the same gap.
async function allocateCheckin(registrationId) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = await smallestGap();
    try {
      const updated = await Registration.findOneAndUpdate(
        { _id: registrationId, $or: [{ teamNumber: null }, { teamNumber: { $exists: false } }] },
        { $set: { teamNumber: candidate, checkedInAt: new Date(), checkinStatus: 'checked-in' } },
        { new: true }
      ).lean();
      if (updated) {
        syncCounterFloor().catch(() => {});
        return updated;
      }
      // Already claimed by concurrent request on same doc.
      return await Registration.findById(registrationId).lean();
    } catch (err) {
      if (err && err.code === 11000) continue; // gap taken by another team, recompute
      throw err;
    }
  }
  // Fallback: Counter increment if gaps keep colliding.
  const doc = await Counter.findOneAndUpdate({ _id: 'teamNumber' }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  const updated = await Registration.findOneAndUpdate(
    { _id: registrationId, $or: [{ teamNumber: null }, { teamNumber: { $exists: false } }] },
    { $set: { teamNumber: doc.seq, checkedInAt: new Date(), checkinStatus: 'checked-in' } },
    { new: true }
  ).lean();
  return updated || (await Registration.findById(registrationId).lean());
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
      return res.status(400).json({ error: 'Team name and Team leader name are required' });
    }
    const match = await findMatch(ideaTitle, leaderName);
    if (!match) {
      return res.status(404).json({ error: 'No matching registration found. Check Team name and Team leader spelling.' });
    }
    // Idempotent duplicate: already checked in -> return same number, no new allocation.
    if (match.teamNumber != null) {
      const fresh = await Registration.findById(match._id).lean();
      return res.json({ ok: true, alreadyCheckedIn: true, ...publicTeamPayload(fresh) });
    }
    // Allocate smallest free number (gap-fill: deleted numbers are reused).
    const updated = await allocateCheckin(match._id);
    if (updated && updated.teamNumber != null) {
      return res.status(201).json({ ok: true, alreadyCheckedIn: false, ...publicTeamPayload(updated) });
    }
    // Lost race on same doc (duplicate concurrent submit) -> return winner's number.
    const winner = await Registration.findById(match._id).lean();
    return res.json({ ok: true, alreadyCheckedIn: true, ...publicTeamPayload(winner) });
  } catch (err) {
    // Duplicate-key race between different teams -> client retries to get next gap.
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'Check-in conflict, please try again' });
    }
    console.error('[checkin:create]', err.message);
    return res.status(500).json({ error: 'Check-in failed. Try again.' });
  }
});

// GET /api/checkin/lookup — public, minimal autocomplete + selectable log data only.
// Returns [{ ideaTitle, founderName, leaderName, teamNumber, checkedIn }]
// for eligible (pending/shortlisted/accepted) registrations.
// No emails, phones, or other sensitive fields.
router.get('/lookup', requireDb, async (req, res) => {
  try {
    const items = await Registration.find({ status: { $in: ELIGIBLE_STATUSES } })
      .select('ideaTitle fullName teamNumber checkinStatus')
      .sort({ ideaTitle: 1 })
      .limit(500)
      .lean();
    return res.json({
      items: items.map((r) => ({
        ideaTitle: r.ideaTitle,
        founderName: r.fullName,
        leaderName: r.fullName,
        teamNumber: r.teamNumber ?? null,
        checkedIn: r.teamNumber != null,
      })),
    });
  } catch (err) {
    console.error('[checkin:lookup]', err.message);
    return res.status(500).json({ error: 'Could not load lookup' });
  }
});

// ---- Admin (uses existing admin auth; any authenticated admin) ----

// GET /api/checkin/admin/status — counts + next number (smallest gap, reused on delete/undo)
router.get('/admin/status', requireDb, requireAuth, async (req, res) => {
  try {
    const [total, checkedIn] = await Promise.all([
      Registration.countDocuments({ status: { $in: ELIGIBLE_STATUSES } }),
      Registration.countDocuments({ status: { $in: ELIGIBLE_STATUSES }, teamNumber: { $type: 'number' } }),
    ]);
    const nextTeamNumber = await smallestGap();
    return res.json({
      totalRegistered: total,
      checkedIn,
      notCheckedIn: total - checkedIn,
      nextTeamNumber,
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

// POST /api/checkin/admin/checkin/:id — manual check-in of one pending registration.
// Gap-fill: smallest missing team number is reused.
router.post('/admin/checkin/:id', requireDb, requireAuth, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    if (!ELIGIBLE_STATUSES.includes(reg.status)) {
      return res.status(400).json({ error: 'Only pending / shortlisted / accepted can be checked in' });
    }
    if (reg.teamNumber != null) {
      return res.json({ ok: true, alreadyCheckedIn: true, ...publicTeamPayload(reg.toObject()) });
    }
    const final = await allocateCheckin(reg._id);
    const who = actorOf(req);
    logAudit({ ...who, action: 'checkin', entity: 'registration', entityId: String(final._id), summary: `Manual check-in TEAM ${final.teamNumber} — ${final.ideaTitle}` }).catch(() => {});
    return res.status(201).json({ ok: true, alreadyCheckedIn: false, ...publicTeamPayload(final) });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ error: 'Check-in conflict, try again' });
    console.error('[checkin:manual]', err.message);
    return res.status(500).json({ error: 'Manual check-in failed' });
  }
});

// POST /api/checkin/admin/undo/:id — undo check-in (keeps registration).
// Teams above shift down immediately (TEAM 3 -> TEAM 2), old feedback for the
// freed number is removed so the new occupant starts clean.
router.post('/admin/undo/:id', requireDb, requireAuth, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    if (reg.teamNumber == null) return res.status(400).json({ error: 'Team is not checked in' });
    const freed = reg.teamNumber;
    const regId = reg._id;
    // $unset (not null) so partial-unique index never sees a null value.
    await Registration.updateOne(
      { _id: regId },
      { $unset: { teamNumber: '' }, $set: { checkedInAt: null, checkinStatus: 'pending' } }
    );
    await cleanupTeamArtifacts(regId, freed);
    const shifted = await compactFrom(freed);
    const who = actorOf(req);
    logAudit({ ...who, action: 'undo-checkin', entity: 'registration', entityId: String(regId), summary: `Undid check-in TEAM ${freed} — ${reg.ideaTitle} (${shifted.length} shifted)` }).catch(() => {});
    return res.json({ ok: true, freedTeamNumber: freed, shifted });
  } catch (err) {
    console.error('[checkin:undo]', err.message);
    return res.status(500).json({ error: 'Undo check-in failed' });
  }
});

// DELETE /api/checkin/admin/teams/:id — hard delete the registration row.
// Teams above shift down immediately (TEAM 3 -> TEAM 2), old feedback for the
// deleted number is removed so the new occupant starts clean.
router.delete('/admin/teams/:id', requireDb, requireAuth, async (req, res) => {
  try {
    const existing = await Registration.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ error: 'Registration not found' });
    const freed = existing.teamNumber ?? null;
    const regId = existing._id;
    await Registration.deleteOne({ _id: regId });
    let shifted = [];
    if (freed != null) {
      await cleanupTeamArtifacts(regId, freed);
      shifted = await compactFrom(freed);
    }
    const who = actorOf(req);
    logAudit({ ...who, action: 'delete', entity: 'registration', entityId: String(regId), summary: `Deleted from check-in ${freed != null ? `TEAM ${freed} — ` : ''}${existing.fullName} — ${existing.ideaTitle} (${shifted.length} shifted)` }).catch(() => {});
    return res.json({ ok: true, deletedTeamNumber: freed, shifted });
  } catch (err) {
    console.error('[checkin:delete]', err.message);
    return res.status(500).json({ error: 'Delete failed' });
  }
});

// POST /api/checkin/admin/fix-indexes — one-off repair for E11000 { teamNumber: null }.
// Drops the legacy plain-unique teamNumber_1 index, unsets explicit nulls so
// pendings carry no field, and ensures the partial-unique index exists.
// Run once from Admin after deploy if Excel import throws duplicate null.
router.post('/admin/fix-indexes', requireDb, requireAuth, async (req, res) => {
  try {
    const coll = Registration.collection;
    let dropped = null;
    try {
      await coll.dropIndex('teamNumber_1');
      dropped = 'teamNumber_1';
    } catch (e) {
      if (!/index not found/i.test(e.message || '')) throw e;
    }
    const unset = await Registration.updateMany(
      { teamNumber: null },
      { $unset: { teamNumber: '' } }
    );
    try {
      await coll.createIndex(
        { teamNumber: 1 },
        { unique: true, partialFilterExpression: { teamNumber: { $type: 'number' } }, name: 'teamNumber_partial_unique' }
      );
    } catch (e) {
      if (!/already exists/i.test(e.message || '')) throw e;
    }
    const indexes = await coll.indexes();
    return res.json({
      ok: true,
      dropped,
      unsetNulls: unset.modifiedCount,
      teamIndexes: indexes.filter((i) => JSON.stringify(i.key).includes('teamNumber')),
    });
  } catch (err) {
    console.error('[checkin:fix-indexes]', err.message);
    return res.status(500).json({ error: 'Index repair failed: ' + err.message });
  }
});

module.exports = router;
