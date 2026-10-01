import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../lib/api';

export const Checkin = () => {
  const [ideaTitle, setIdeaTitle] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  // Autocomplete sourced from existing registrations:
  // Founder column -> founder name, Idea & deck column -> idea name.
  const [lookup, setLookup] = useState([]);

  useEffect(() => {
    api.checkinLookup().then((d) => setLookup(d.items || [])).catch(() => setLookup([]));
  }, []);

  const founders = [...new Set(lookup.map((r) => r.founderName).filter(Boolean))].sort();
  const ideas = [...new Set(lookup.map((r) => r.ideaTitle).filter(Boolean))].sort();

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const d = await api.checkin({ ideaTitle: ideaTitle.trim(), leaderName: leaderName.trim() });
      setResult(d);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  if (result) {
    return (
      <div className="max-w-md mx-auto pt-10 pb-12 px-4">
        <Card hairline className="!p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-brand text-white flex items-center justify-center text-xl border-glow">
            <i className="fa-solid fa-check" />
          </div>
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">
            {result.alreadyCheckedIn ? 'Already checked in' : '✓ Check-in successful'}
          </p>
          {result.alreadyCheckedIn && (
            <p className="text-sm opacity-70">You have already checked in.</p>
          )}
          <div>
            <div className="field-label">Your Team Number</div>
            <div className="font-display text-5xl font-extrabold mt-1">
              TEAM {String(result.teamNumber).padStart(2, '0')}
            </div>
          </div>
          <div className="text-sm space-y-1">
            <div><span className="opacity-60">Idea & deck:</span> <b>{result.ideaTitle}</b></div>
            <div><span className="opacity-60">Founder:</span> <b>{result.leaderName}</b></div>
          </div>
          <p className="text-xs font-bold text-gold-600 dark:text-gold-300 border border-gold-500/30 bg-gold-500/10 rounded-xl px-3 py-2.5">
            Please remember your Team Number. It will be used during feedback verification.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-10 pb-12 px-4">
      <Card hairline className="!p-8 space-y-5">
        <div className="text-center space-y-2">
          <span className="section-badge">QR #1 · Entrance</span>
          <h1 className="font-display text-2xl font-extrabold">STARTUP EVENT CHECK-IN</h1>
          <p className="text-xs opacity-60">Founder only. No team number needed — assigned automatically.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="field-label">Idea & deck name *</label>
            <input
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              className="field"
              placeholder="e.g. EcoTrack"
              list="checkin-ideas"
              autoComplete="off"
              required
            />
            <datalist id="checkin-ideas">
              {ideas.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Founder name *</label>
            <input
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              className="field"
              placeholder="e.g. Rahul Sharma"
              list="checkin-founders"
              autoComplete="off"
              required
            />
            <datalist id="checkin-founders">
              {founders.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          {error && (
            <p className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">{error}</p>
          )}
          <Button type="submit" variant="gold" className="w-full !py-4" disabled={busy}>
            {busy ? 'Checking in…' : 'Check in'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
