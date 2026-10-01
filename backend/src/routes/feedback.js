const express = require('express');
const crypto = require('crypto');
const Registration = require('../models/Registration');
const PresentationSession = require('../models/PresentationSession');
const FeedbackViewer = require('../models/FeedbackViewer');
const Feedback = require('../models/Feedback');
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
const ELIGIBLE_STATUSES = ['pending', 'shortlisted', 'accepted'];
const REVIEWER_ROLES = ['founder', 'co-founder', 'member', 'audience'];
function makeAnonId() {
  return crypto.randomBytes(24).toString('hex');
}

async function getActiveSession() {
  return PresentationSession.findOne({ status: 'ACTIVE' }).lean();
}

// GET /api/feedback/active — public, minimal info only
router.get('/active', requireDb, async (req, res) => {
  try {
    const session = await getActiveSession();
    if (!session) return res.json({ active: false });
    const presenting = await Registration.findById(session.presentingRegistrationId)
      .select('ideaTitle teamNumber')
      .lean();
    return res.json({
      active: true,
      teamNumber: session.teamNumber,
      ideaTitle: presenting ? presenting.ideaTitle : undefined,
    });
  } catch (err) {
    console.error('[feedback:active]', err.message);
    return res.status(500).json({ error: 'Could not load feedback status' });
  }
});

// POST /api/feedback/verify — { reviewerTeamNumber, role, anonId? }
// Legacy { ideaTitle, teamNumber, leaderName } still accepted for backwards compat.
router.post('/verify', requireDb, async (req, res) => {
  try {
    const session = await getActiveSession();
    if (!session) return res.status(403).json({ error: 'Feedback is not active right now' });

    let reviewer = null;
    let reviewerTeamNumber = null;
    let reviewerRole = '';
    let audienceName = '';
    let audiencePrn = '';

    if (req.body.reviewerTeamNumber !== undefined || req.body.role !== undefined) {
      reviewerRole = String(req.body.role || '').trim().toLowerCase();
      if (!REVIEWER_ROLES.includes(reviewerRole)) {
        return res.status(400).json({ error: 'Role must be founder, co-founder, member or audience' });
      }
      if (reviewerRole === 'audience') {
        audienceName = norm(req.body.audienceName || req.body.fullName);
        audiencePrn = norm(req.body.audiencePrn || req.body.prn);
        if (!audienceName || !audiencePrn) {
          return res.status(400).json({ error: 'Full Name and PRN are required for audience' });
        }
        reviewer = null;
        reviewerTeamNumber = null;
      } else {
        reviewerTeamNumber = Number(req.body.reviewerTeamNumber);
        if (!Number.isInteger(reviewerTeamNumber)) {
          return res.status(400).json({ error: 'Team Number and Role are required' });
        }
        reviewer = await Registration.findOne({
          teamNumber: reviewerTeamNumber,
          status: { $in: ELIGIBLE_STATUSES },
        }).lean();
        if (!reviewer) {
          return res.status(404).json({ error: 'Invalid team number. Only checked-in teams can give feedback.' });
        }
      }
    } else {
      // Backwards compat: old 3-field form
      const ideaTitle = norm(req.body.ideaTitle);
      const leaderName = norm(req.body.leaderName);
      const teamNumber = Number(req.body.teamNumber);
      if (!ideaTitle || !leaderName || !Number.isInteger(teamNumber)) {
        return res.status(400).json({ error: 'Team Number and Role are required' });
      }
      reviewer = await Registration.findOne({
        teamNumber,
        ideaTitle: exactInsensitive(ideaTitle),
        fullName: exactInsensitive(leaderName),
        status: { $in: ELIGIBLE_STATUSES },
      }).lean();
      if (!reviewer) {
        return res.status(404).json({ error: 'Details do not match our records.' });
      }
      reviewerTeamNumber = reviewer.teamNumber;
      reviewerRole = '';
    }

    // Self-feedback blocked (by team number + by record id). Audience has no team, so skip.
    if (reviewerRole !== 'audience' && Number(reviewerTeamNumber) === Number(session.teamNumber)) {
      return res.status(403).json({ error: 'You cannot submit feedback for your own team.' });
    }
    if (reviewer && String(reviewer._id) === String(session.presentingRegistrationId)) {
      return res.status(403).json({ error: 'You cannot submit feedback for your own team.' });
    }

    let anonId = String(req.body.anonId || '').trim();
    let viewer = null;
    if (anonId) viewer = await FeedbackViewer.findOne({ anonId }).lean();
    if (!viewer) {
      anonId = makeAnonId();
      try {
        viewer = (await FeedbackViewer.create({
          anonId,
          registrationId: reviewer ? reviewer._id : null,
          reviewerTeamNumber,
          reviewerRole,
          audienceName,
          audiencePrn,
        })).toObject();
      } catch (e) {
        // Unique race: retry fetch
        viewer = await FeedbackViewer.findOne({ anonId }).lean();
      }
    } else {
      await FeedbackViewer.updateOne(
        { anonId },
        { $set: { registrationId: reviewer ? reviewer._id : null, reviewerTeamNumber, reviewerRole, audienceName, audiencePrn } }
      );
    }

    const existing = await Feedback.findOne({ presentationSessionId: session._id, anonId }).lean();
    if (existing) {
      return res.json({ ok: true, anonId, alreadySubmitted: true });
    }
    // Set anonymous cookie (supplementary; localStorage token is primary for cross-origin).
    res.cookie('sebc_fb', anonId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 12 * 60 * 60 * 1000,
    });
    return res.json({ ok: true, anonId, alreadySubmitted: false });
  } catch (err) {
    console.error('[feedback:verify]', err.message);
    return res.status(500).json({ error: 'Verification failed. Try again.' });
  }
});

// POST /api/feedback/submit — { anonId, ratings{6}, likedMost, improve, wouldUse }
router.post('/submit', requireDb, async (req, res) => {
  try {
    const session = await getActiveSession();
    if (!session) return res.status(403).json({ error: 'Feedback is closed' });

    const anonId = String(req.body.anonId || '').trim();
    if (!anonId) return res.status(400).json({ error: 'Missing session. Verify again.' });
    const viewer = await FeedbackViewer.findOne({ anonId }).lean();
    if (!viewer || (!viewer.registrationId && viewer.reviewerTeamNumber == null && viewer.reviewerRole !== 'audience')) {
      return res.status(401).json({ error: 'Verify your details first' });
    }
    const isAudience = viewer.reviewerRole === 'audience';
    let reviewer = null;
    if (!isAudience) {
      if (viewer.registrationId) {
        reviewer = await Registration.findById(viewer.registrationId).lean();
      }
      if (!reviewer && viewer.reviewerTeamNumber != null) {
        reviewer = await Registration.findOne({
          teamNumber: viewer.reviewerTeamNumber,
          status: { $in: ELIGIBLE_STATUSES },
        }).lean();
      }
      if (!reviewer || ELIGIBLE_STATUSES.indexOf(reviewer.status) === -1 || reviewer.teamNumber == null) {
        return res.status(403).json({ error: 'Reviewer record invalid. Verify again.' });
      }
    }
    const reviewerTeamNumber = isAudience ? null : (viewer.reviewerTeamNumber != null ? viewer.reviewerTeamNumber : reviewer.teamNumber);
    const reviewerRole = viewer.reviewerRole || '';
    const audienceName = viewer.audienceName || '';
    const audiencePrn = viewer.audiencePrn || '';
    if (!isAudience && Number(reviewerTeamNumber) === Number(session.teamNumber)) {
      return res.status(403).json({ error: 'You cannot submit feedback for your own team.' });
    }
    if (reviewer && String(reviewer._id) === String(session.presentingRegistrationId)) {
      return res.status(403).json({ error: 'You cannot submit feedback for your own team.' });
    }

    const r = req.body.ratings || {};
    const keys = ['innovation', 'clarity', 'solution', 'market', 'feasibility', 'presentation'];
    const ratings = {};
    for (const k of keys) {
      const v = Number(r[k]);
      if (!Number.isInteger(v) || v < 1 || v > 5) {
        return res.status(400).json({ error: `Rating "${k}" must be 1–5` });
      }
      ratings[k] = v;
    }
    const likedMost = String(req.body.likedMost || '').slice(0, 1000);
    const improve = String(req.body.improve || '').slice(0, 1000);
    let wouldUse = String(req.body.wouldUse || '').toUpperCase();
    if (wouldUse && !['YES', 'MAYBE', 'NO'].includes(wouldUse)) {
      return res.status(400).json({ error: 'wouldUse must be YES, MAYBE or NO' });
    }
    if (!wouldUse) wouldUse = '';

    try {
      await Feedback.create({
        presentationSessionId: session._id,
        anonId,
        reviewerRegistrationId: reviewer ? reviewer._id : null,
        reviewerTeamNumber,
        reviewerRole,
        audienceName,
        audiencePrn,
        presentingRegistrationId: session.presentingRegistrationId,
        teamNumber: session.teamNumber,
        ratings,
        likedMost,
        improve,
        wouldUse,
      });
    } catch (e) {
      if (e && e.code === 11000) {
        return res.status(409).json({ error: 'You have already submitted feedback for this presentation.' });
      }
      throw e;
    }
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[feedback:submit]', err.message);
    return res.status(500).json({ error: 'Submission failed. Try again.' });
  }
});

// ---- Admin ----
router.post('/admin/start', requireDb, requireAuth, async (req, res) => {
  try {
    const teamNumber = Number(req.body.teamNumber);
    if (!Number.isInteger(teamNumber)) return res.status(400).json({ error: 'teamNumber is required' });
    const reg = await Registration.findOne({ teamNumber, status: { $in: ELIGIBLE_STATUSES } });
    if (!reg || reg.teamNumber == null) return res.status(404).json({ error: 'Checked-in team not found for that number' });
    await PresentationSession.updateMany({ status: 'ACTIVE' }, { $set: { status: 'CLOSED', endedAt: new Date() } });
    const session = await PresentationSession.create({
      presentingRegistrationId: reg._id,
      teamNumber: reg.teamNumber,
      status: 'ACTIVE',
    });
    const checkedCount = await Registration.countDocuments({ status: { $in: ELIGIBLE_STATUSES }, teamNumber: { $ne: null } });
    await PresentationSession.updateOne({ _id: session._id }, { $set: { expectedCount: checkedCount } });
    return res.status(201).json({ ok: true, session });
  } catch (err) {
    console.error('[feedback:start]', err.message);
    return res.status(500).json({ error: 'Could not start feedback' });
  }
});

router.post('/admin/close', requireDb, requireAuth, async (req, res) => {
  try {
    await PresentationSession.updateMany({ status: 'ACTIVE' }, { $set: { status: 'CLOSED', endedAt: new Date() } });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[feedback:close]', err.message);
    return res.status(500).json({ error: 'Could not close feedback' });
  }
});

router.get('/admin/status', requireDb, requireAuth, async (req, res) => {
  try {
    const session = await getActiveSession();
    if (!session) return res.json({ active: false });
    const presenting = await Registration.findById(session.presentingRegistrationId)
      .select('ideaTitle fullName teamNumber')
      .lean();
    const count = await Feedback.countDocuments({ presentationSessionId: session._id });
    return res.json({
      active: true,
      session,
      presenting,
      responses: count,
      expected: session.expectedCount || 0,
    });
  } catch (err) {
    console.error('[feedback:status]', err.message);
    return res.status(500).json({ error: 'Could not load status' });
  }
});

const FEEDBACK_COLS = ['presentedTeam', 'ideaTitle', 'reviewerType', 'reviewerTeam', 'reviewerRole', 'audienceName', 'audiencePrn', 'innovation', 'clarity', 'solution', 'market', 'feasibility', 'presentation', 'avg', 'likedMost', 'improve', 'wouldUse', 'submittedAt'];
const escCsv = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
function feedbackRow(teamNumber, ideaTitle, f) {
  const avg = Number(
    ((f.ratings.innovation + f.ratings.clarity + f.ratings.solution + f.ratings.market + f.ratings.feasibility + f.ratings.presentation) / 6).toFixed(2)
  );
  return [
    teamNumber,
    ideaTitle || '',
    f.reviewerRole === 'audience' ? 'audience' : 'team',
    f.reviewerTeamNumber ?? '',
    f.reviewerRole || '',
    f.audienceName || '',
    f.audiencePrn || '',
    f.ratings.innovation,
    f.ratings.clarity,
    f.ratings.solution,
    f.ratings.market,
    f.ratings.feasibility,
    f.ratings.presentation,
    avg,
    f.likedMost || '',
    f.improve || '',
    f.wouldUse || '',
    f.createdAt ? new Date(f.createdAt).toISOString() : '',
  ].map(escCsv).join(',');
}

router.get('/admin/export', requireDb, requireAuth, async (req, res) => {
  try {
    const teamNumber = Number(req.query.teamNumber);
    // Team merge: one file for whole team (all its sessions). Falls back to legacy sessionId.
    if (Number.isInteger(teamNumber)) {
      const sessions = await PresentationSession.find({ teamNumber }).lean();
      if (!sessions.length) return res.status(404).json({ error: 'No sessions for that team' });
      const ids = sessions.map((s) => s._id);
      const presenting = await Registration.findOne({ teamNumber }).select('ideaTitle').lean();
      const items = await Feedback.find({ presentationSessionId: { $in: ids } }).sort({ createdAt: 1 }).lean();
      const csv = [[...FEEDBACK_COLS].join(','), ...items.map((f) => feedbackRow(teamNumber, presenting?.ideaTitle, f))].join('\n');
      const teamPad = String(teamNumber).padStart(2, '0');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="team-${teamPad}-feedback.csv"`);
      return res.send(csv);
    }
    const sessionId = String(req.query.sessionId || '').trim();
    if (!sessionId) return res.status(400).json({ error: 'teamNumber or sessionId is required' });
    const target = await PresentationSession.findById(sessionId).lean();
    if (!target) return res.status(404).json({ error: 'Session not found' });
    const presenting = await Registration.findById(target.presentingRegistrationId)
      .select('ideaTitle fullName teamNumber')
      .lean();
    const items = await Feedback.find({ presentationSessionId: sessionId }).sort({ createdAt: 1 }).lean();
    const csv = [[...FEEDBACK_COLS].join(','), ...items.map((f) => feedbackRow(target.teamNumber, presenting?.ideaTitle, f))].join('\n');
    const teamPad = String(target.teamNumber).padStart(2, '0');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="team-${teamPad}-feedback.csv"`);
    return res.send(csv);
  } catch (err) {
    console.error('[feedback:export]', err.message);
    return res.status(500).json({ error: 'Export failed' });
  }
});

router.get('/admin/export-all', requireDb, requireAuth, async (req, res) => {
  try {
    // Merged all teams: Team 1 block, then Team 2, then Team 3...
    const items = await Feedback.find({}).sort({ teamNumber: 1, createdAt: 1 }).lean();
    const teamNumbers = [...new Set(items.map((f) => f.teamNumber))];
    const regs = await Registration.find({ teamNumber: { $in: teamNumbers } }).select('ideaTitle teamNumber').lean();
    const titleMap = {};
    regs.forEach((r) => { titleMap[r.teamNumber] = r.ideaTitle; });
    const csv = [[...FEEDBACK_COLS].join(','), ...items.map((f) => feedbackRow(f.teamNumber, titleMap[f.teamNumber], f))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="all-teams-feedback.csv"');
    return res.send(csv);
  } catch (err) {
    console.error('[feedback:export-all]', err.message);
    return res.status(500).json({ error: 'Export failed' });
  }
});

router.get('/admin/results', requireDb, requireAuth, async (req, res) => {
  try {
    const session = await getActiveSession();
    // ?history=1 returns all sessions with response counts + titles (persists after close)
    if (req.query.history === '1') {
      const sessions = await PresentationSession.find({}).sort({ startedAt: -1 }).limit(100).lean();
      const counts = await Feedback.aggregate([
        { $group: { _id: '$presentationSessionId', total: { $sum: 1 } } },
      ]);
      const countMap = {};
      counts.forEach((c) => { countMap[String(c._id)] = c.total; });
      const regIds = [...new Set(sessions.map((s) => String(s.presentingRegistrationId)))];
      const regs = await Registration.find({ _id: { $in: regIds } }).select('ideaTitle fullName teamNumber').lean();
      const regMap = {};
      regs.forEach((r) => { regMap[String(r._id)] = r; });
      return res.json({
        sessions: sessions.map((s) => ({
          ...s,
          responses: countMap[String(s._id)] || 0,
          ideaTitle: regMap[String(s.presentingRegistrationId)]?.ideaTitle || '',
          founderName: regMap[String(s.presentingRegistrationId)]?.fullName || '',
        })),
      });
    }
    const teamNumberQ = req.query.teamNumber !== undefined ? Number(req.query.teamNumber) : null;
    if (Number.isInteger(teamNumberQ)) {
      // Merged team view: all sessions for this team combined.
      const teamSessions = await PresentationSession.find({ teamNumber: teamNumberQ }).lean();
      const ids = teamSessions.map((s) => s._id);
      const items = ids.length ? await Feedback.find({ presentationSessionId: { $in: ids } }).sort({ createdAt: -1 }).lean() : [];
      const keys = ['innovation', 'clarity', 'solution', 'market', 'feasibility', 'presentation'];
      const averages = {};
      for (const k of keys) {
        averages[k] = items.length ? Number((items.reduce((s, f) => s + (f.ratings?.[k] || 0), 0) / items.length).toFixed(2)) : 0;
      }
      const latest = teamSessions.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0] || null;
      return res.json({ active: !!session, session: latest, teamNumber: teamNumberQ, total: items.length, averages, items });
    }
    const sessionId = req.query.sessionId || (session && String(session._id));
    if (!sessionId) return res.json({ active: false, items: [], total: 0 });
    const target = await PresentationSession.findById(sessionId).lean();
    const items = await Feedback.find({ presentationSessionId: sessionId }).sort({ createdAt: -1 }).lean();
    const keys = ['innovation', 'clarity', 'solution', 'market', 'feasibility', 'presentation'];
    const averages = {};
    for (const k of keys) {
      averages[k] = items.length ? Number((items.reduce((s, f) => s + (f.ratings?.[k] || 0), 0) / items.length).toFixed(2)) : 0;
    }
    return res.json({ active: !!session, session: target || null, total: items.length, averages, items });
  } catch (err) {
    console.error('[feedback:results]', err.message);
    return res.status(500).json({ error: 'Could not load results' });
  }
});

module.exports = router;
