import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../lib/api';

export const Checkin = () => {
  const [ideaTitle, setIdeaTitle] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  // Selectable log sourced from existing registrations:
  // team name column -> ideaTitle, team leader column -> fullName.
  const [lookup, setLookup] = useState([]);
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    api.checkinLookup().then((d) => setLookup(d.items || [])).catch(() => setLookup([]));
  }, []);

  const teamOf = (r) => r.ideaTitle || '';
  const leaderOf = (r) => r.leaderName || r.founderName || '';

  const filtered = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    const rows = [...lookup].sort((a, b) => String(teamOf(a)).localeCompare(String(teamOf(b))));
    if (!q) return rows.slice(0, 100);
    return rows
      .filter((r) => `${teamOf(r)} ${leaderOf(r)}`.toLowerCase().includes(q))
      .slice(0, 100);
  }, [lookup, logSearch]);

  const pick = (r) => {
    setIdeaTitle(teamOf(r));
    setLeaderName(leaderOf(r));
    setError('');
  };

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
            <div><span className="opacity-60">Team name:</span> <b>{result.ideaTitle}</b></div>
            <div><span className="opacity-60">Team leader:</span> <b>{result.leaderName}</b></div>
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
          <p className="text-xs opacity-60">Team leader only. No team number needed — assigned automatically.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="field-label">Team name *</label>
            <input
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              className="field"
              placeholder="e.g. EcoTrack"
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Team leader name *</label>
            <input
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              className="field"
              placeholder="e.g. Rahul Sharma"
              autoComplete="off"
              required
            />
          </div>
          {error && (
            <p className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">{error}</p>
          )}
          <Button type="submit" variant="gold" className="w-full !py-4" disabled={busy}>
            {busy ? 'Checking in…' : 'Check in'}
          </Button>
        </form>
      </Card>

      <Card hairline className="!p-5 mt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display font-bold">Registered teams ({lookup.length})</h2>
          {(ideaTitle || leaderName) && (
            <button type="button" onClick={() => { setIdeaTitle(''); setLeaderName(''); }} className="font-mono text-[11px] opacity-60 hover:opacity-100">
              Clear selection
            </button>
          )}
        </div>
        <p className="font-mono text-[11px] opacity-60">Tap a team below to fill the form — or type manually above.</p>
        <input
          value={logSearch}
          onChange={(e) => setLogSearch(e.target.value)}
          className="field"
          placeholder="Search team or leader…"
          autoComplete="off"
        />
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <p className="font-mono text-xs opacity-60 py-4 text-center">
              {lookup.length === 0 ? 'No teams loaded. Check connection.' : 'No match. Try another spelling.'}
            </p>
          ) : filtered.map((r, i) => {
            const team = teamOf(r);
            const leader = leaderOf(r);
            const active = ideaTitle.trim() === team && leaderName.trim() === leader && team !== '';
            return (
              <button
                key={`${team}-${leader}-${i}`}
                type="button"
                onClick={() => pick(r)}
                className={`w-full text-left rounded-xl border px-3 py-2.5 transition ${active ? 'border-gold-500 bg-gold-500/10' : 'border-black/10 dark:border-white/10 hover:border-gold-500/60'}`}
              >
                <div className="font-bold text-sm truncate">{team}</div>
                <div className="font-mono text-[11px] opacity-60 truncate">
                  {leader}
                  {r.teamNumber != null ? ` · TEAM ${String(r.teamNumber).padStart(2, '0')} ✓` : ' · pending'}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
