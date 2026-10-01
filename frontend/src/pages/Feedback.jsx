import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../lib/api';

const RATING_FIELDS = [
  ['innovation', 'Innovation'],
  ['clarity', 'Problem clarity'],
  ['solution', 'Solution effectiveness'],
  ['market', 'Market potential'],
  ['feasibility', 'Feasibility'],
  ['presentation', 'Presentation quality'],
];

const ROLES = ['founder', 'co-founder', 'member', 'audience'];

const ANON_KEY = 'sebc_feedback_anon';

export const Feedback = () => {
  const [active, setActive] = useState(null);
  const [reviewerTeamNumber, setReviewerTeamNumber] = useState('');
  const [role, setRole] = useState('founder');
  const [audienceName, setAudienceName] = useState('');
  const [audiencePrn, setAudiencePrn] = useState('');
  const [anonId, setAnonId] = useState(() => localStorage.getItem(ANON_KEY) || '');
  const [verified, setVerified] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ratings, setRatings] = useState({ innovation: 0, clarity: 0, solution: 0, market: 0, feasibility: 0, presentation: 0 });
  const [likedMost, setLikedMost] = useState('');
  const [improve, setImprove] = useState('');
  const [wouldUse, setWouldUse] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.feedbackActive().then(setActive).catch(() => setActive({ active: false }));
  }, []);

  const verify = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const payload =
        role === 'audience'
          ? { role: 'audience', audienceName: audienceName.trim(), audiencePrn: audiencePrn.trim(), anonId: anonId || undefined }
          : { reviewerTeamNumber: Number(reviewerTeamNumber), role, anonId: anonId || undefined };
      const d = await api.feedbackVerify(payload);
      setAnonId(d.anonId);
      localStorage.setItem(ANON_KEY, d.anonId);
      if (d.alreadySubmitted) {
        setAlreadySubmitted(true);
      } else {
        setVerified(true);
      }
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await api.feedbackSubmit({ anonId, ratings, likedMost, improve, wouldUse });
      setDone(true);
    } catch (err) {
      if (/already submitted/i.test(err.message)) setAlreadySubmitted(true);
      else setError(err.message);
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto pt-10 pb-12 px-4">
        <Card hairline className="!p-8 text-center space-y-3">
          <div className="text-4xl">✓</div>
          <h1 className="font-display text-xl font-extrabold">THANKS FOR YOUR FEEDBACK!</h1>
          <p className="text-sm opacity-70">Your feedback has been successfully submitted. You may close this tab.</p>
        </Card>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="max-w-md mx-auto pt-10 pb-12 px-4">
        <Card hairline className="!p-8 text-center space-y-3">
          <h1 className="font-display text-xl font-extrabold">Already submitted</h1>
          <p className="text-sm opacity-70">You have already submitted feedback for this presentation.</p>
        </Card>
      </div>
    );
  }

  if (active && active.active === false) {
    return (
      <div className="max-w-md mx-auto pt-10 pb-12 px-4">
        <Card hairline className="!p-8 text-center space-y-3">
          <h1 className="font-display text-xl font-extrabold">Feedback closed</h1>
          <p className="text-sm opacity-70">No presentation is accepting feedback right now. Scan the QR on the event screen when the next team starts.</p>
        </Card>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="max-w-md mx-auto pt-10 pb-12 px-4">
        <Card hairline className="!p-8 space-y-5">
          <div className="text-center space-y-2">
            <span className="section-badge">QR #2 · Peer feedback</span>
            <h1 className="font-display text-2xl font-extrabold">STARTUP IDEAS FEEDBACK</h1>
            {active && active.active && (
              <div className="rounded-2xl bg-ink-950 dark:bg-gold-400 px-4 py-3 shadow-card">
                <div className="font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-white/80 dark:text-[#1A1405]/80">Now presenting</div>
                <div className="font-display text-xl sm:text-2xl font-extrabold text-white dark:text-[#1A1405] leading-snug mt-1">
                  TEAM {String(active.teamNumber).padStart(2, '0')} · {active.ideaTitle}
                </div>
              </div>
            )}
          </div>
          <form onSubmit={verify} className="space-y-4">
            {role !== 'audience' ? (
              <div className="space-y-1.5">
                <label className="field-label">Your Team Number *</label>
                <input type="number" min="1" value={reviewerTeamNumber} onChange={(e) => setReviewerTeamNumber(e.target.value)} className="field" placeholder="e.g. 12" required={role !== 'audience'} />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="field-label">Full Name *</label>
                  <input value={audienceName} onChange={(e) => setAudienceName(e.target.value)} className="field" placeholder="e.g. Aarav Sharma" autoComplete="off" required />
                </div>
                <div className="space-y-1.5">
                  <label className="field-label">PRN *</label>
                  <input value={audiencePrn} onChange={(e) => setAudiencePrn(e.target.value)} className="field" placeholder="e.g. 220101234001" autoComplete="off" required />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <label className="field-label">Your Role *</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 rounded-xl font-mono text-[11px] font-bold border transition uppercase ${
                      role === r ? 'bg-gradient-gold text-[#1A1405] border-transparent' : 'border-black/15 dark:border-white/15 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {role === 'audience' && (
                <p className="text-[11px] opacity-60">Attending the session but not in a presenting team? Use audience.</p>
              )}
            </div>
            {error && <p className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">{error}</p>}
            <Button type="submit" variant="gold" className="w-full !py-4" disabled={busy}>{busy ? 'Verifying…' : 'Continue'}</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-10 pb-12 px-4">
      <Card hairline className="!p-8 space-y-5">
        <div className="text-center">
          <h1 className="font-display text-xl font-extrabold">Rate this presentation</h1>
          <p className="text-xs opacity-60 mt-1">~1 minute · 1 = poor, 5 = excellent</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {RATING_FIELDS.map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <label className="field-label">{label} *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setRatings((p) => ({ ...p, [key]: v }))}
                    className={`flex-1 py-2.5 rounded-xl font-display text-sm font-bold border transition ${
                      ratings[key] === v
                        ? 'bg-gradient-gold text-[#1A1405] border-transparent'
                        : 'border-black/15 dark:border-white/15 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="field-label">What did you like most?</label>
            <textarea value={likedMost} onChange={(e) => setLikedMost(e.target.value)} rows={2} className="field resize-y" placeholder="Short text" />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">What could they improve?</label>
            <textarea value={improve} onChange={(e) => setImprove(e.target.value)} rows={2} className="field resize-y" placeholder="Short text" />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Would you use / support this startup?</label>
            <div className="flex gap-2">
              {['YES', 'MAYBE', 'NO'].map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setWouldUse(o)}
                  className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold border transition ${
                    wouldUse === o ? 'bg-ink-950 text-cream-50 border-ink-950 dark:bg-gold-400 dark:text-[#1A1405]' : 'border-black/15 dark:border-white/15 opacity-70 hover:opacity-100'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">{error}</p>}
          <Button type="submit" variant="gold" className="w-full !py-4" disabled={busy || Object.values(ratings).some((v) => v < 1)}>
            {busy ? 'Submitting…' : 'Submit feedback'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
