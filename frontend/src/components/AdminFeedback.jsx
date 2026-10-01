import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from './Card';
import { Button } from './Button';
import { api } from '../lib/api';

export const feedbackQrUrl = () => {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/feedback`;
};

export const FeedbackTab = ({ notify }) => {
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teams, setTeams] = useState({ checkedIn: [] });
  const [pick, setPick] = useState('');
  const [busy, setBusy] = useState(false);
  const [exportingTeam, setExportingTeam] = useState('');
  const [exportingAll, setExportingAll] = useState(false);
  const [fullQr, setFullQr] = useState(false);

  // Merge sessions by team: one card per team with combined responses.
  const grouped = React.useMemo(() => {
    const map = new Map();
    for (const s of sessions) {
      const key = String(s.teamNumber);
      if (!map.has(key)) {
        map.set(key, { teamNumber: s.teamNumber, ideaTitle: s.ideaTitle, sessions: [], responses: 0, latestAt: null, hasActive: false });
      }
      const g = map.get(key);
      g.sessions.push(s);
      g.responses += s.responses || 0;
      if (!g.ideaTitle && s.ideaTitle) g.ideaTitle = s.ideaTitle;
      if (s.status === 'ACTIVE') g.hasActive = true;
      const at = s.startedAt ? new Date(s.startedAt).getTime() : 0;
      if (!g.latestAt || at > g.latestAt) g.latestAt = at;
    }
    return [...map.values()].sort((a, b) => a.teamNumber - b.teamNumber);
  }, [sessions]);

  const load = async () => {
    try {
      const [s, t, h] = await Promise.all([
        api.feedbackAdminStatus().catch(() => ({ active: false })),
        api.checkinTeams().catch(() => ({ checkedIn: [] })),
        api.feedbackAdminHistory().catch(() => ({ sessions: [] })),
      ]);
      setStatus(s);
      setTeams(t);
      setSessions(h.sessions || []);
      // Keep showing selected merged team after close; otherwise follow active presenting team.
      const followTeam = selectedTeam || (s && s.active && s.presenting ? String(s.presenting.teamNumber) : '');
      if (followTeam) {
        const r = await api.feedbackAdminResultsByTeam(followTeam).catch(() => null);
        setResults(r);
      } else {
        if (!selectedTeam) setResults(null);
      }
    } catch (e) {
      notify('error', e.message);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  const start = async () => {
    if (!pick) {
      notify('error', 'Select a checked-in team first');
      return;
    }
    setBusy(true);
    try {
      await api.feedbackAdminStart(Number(pick));
      notify('ok', `Feedback started for TEAM ${pick}`);
      setSelectedTeam(String(pick));
      load();
    } catch (e) {
      notify('error', e.message);
    }
    setBusy(false);
  };

  const close = async () => {
    setBusy(true);
    try {
      await api.feedbackAdminClose();
      notify('ok', 'Feedback closed — history kept below');
      load();
    } catch (e) {
      notify('error', e.message);
    }
    setBusy(false);
  };

  const review = async (teamNumber) => {
    const key = String(teamNumber);
    if (selectedTeam === key) {
      setSelectedTeam('');
      setResults(null);
      return;
    }
    setSelectedTeam(key);
    try {
      const r = await api.feedbackAdminResultsByTeam(key);
      setResults(r);
    } catch (e) {
      notify('error', e.message);
    }
  };

  const downloadExcel = async (teamNumber) => {
    setExportingTeam(String(teamNumber));
    try {
      await api.feedbackAdminExportByTeam(teamNumber);
      notify('ok', `Excel downloaded for TEAM ${String(teamNumber).padStart(2, '0')}`);
    } catch (e) {
      notify('error', e.message);
    }
    setExportingTeam('');
  };

  const downloadAll = async () => {
    setExportingAll(true);
    try {
      await api.feedbackAdminExportAll();
      notify('ok', 'Merged Excel downloaded for all teams');
    } catch (e) {
      notify('error', e.message);
    }
    setExportingAll(false);
  };

  const url = typeof window !== 'undefined' ? feedbackQrUrl() : '';
  const presenting = status && status.active ? status.presenting : null;

  if (fullQr) {
    return (
      <div className="fixed inset-0 z-[100] bg-ink-950 text-white flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="font-mono text-sm tracking-[0.3em] uppercase text-gold-300">Now presenting</div>
        <div className="font-display font-extrabold leading-none">
          <div className="text-6xl sm:text-7xl text-white drop-shadow-[0_0_25px_rgba(221,184,78,0.5)]">
            {presenting ? `TEAM ${String(presenting.teamNumber).padStart(2, '0')}` : 'SCAN TO GIVE FEEDBACK'}
          </div>
          {presenting && (
            <div className="text-4xl sm:text-5xl mt-3 text-gradient-gold">{presenting.ideaTitle}</div>
          )}
        </div>
        <div className="bg-white p-6 rounded-3xl">
          <QRCodeSVG value={url} size={300} />
        </div>
        <div className="font-mono text-lg tracking-[0.25em]">SCAN TO GIVE FEEDBACK</div>
        <Button variant="gold" onClick={() => setFullQr(false)}>Close</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card hairline className="space-y-4 text-center !p-6 sm:!p-8">
        <h3 className="font-mono text-[11px] tracking-[0.25em] uppercase opacity-60">Presentation control</h3>
        {presenting ? (
          <div className="space-y-2">
            <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-300">Now presenting</div>
            <div className="font-display font-extrabold leading-tight">
              <div className="text-5xl sm:text-6xl tracking-tight">
                TEAM {String(presenting.teamNumber).padStart(2, '0')}
              </div>
              <div className="text-2xl sm:text-4xl mt-2 text-gradient-gold">{presenting.ideaTitle}</div>
            </div>
            <div className="font-mono text-xs font-bold text-emerald-500">● ACTIVE</div>
            <div className="font-mono text-sm font-bold opacity-80">Responses: {status.responses} / {status.expected || '—'}</div>
          </div>
        ) : (
          <p className="text-sm opacity-60">No active feedback session. Select a checked-in team below.</p>
        )}
        <div className="inline-block bg-white p-4 rounded-2xl">
          <QRCodeSVG value={url} size={180} />
        </div>
        <div className="font-mono text-[11px] break-all opacity-60">{url}</div>
        <div className="font-mono text-[11px] opacity-60">Permanent QR — points to /#/feedback, follows active team. Different from check-in QR.</div>
        <div className="flex gap-2 justify-center flex-wrap">
          {presenting && (
            <Button variant="gold" onClick={() => setFullQr(true)}>Project full screen</Button>
          )}
          <Button variant="outline" onClick={load}>Refresh</Button>
          {presenting && (
            <Button variant="outline" onClick={close} disabled={busy}>Close feedback</Button>
          )}
        </div>
      </Card>

      <Card hairline className="space-y-4">
        <h3 className="font-display font-bold">Start / Next team</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="field flex-1">
            <option value="">Select checked-in team…</option>
            {(teams.checkedIn || []).map((t) => (
              <option key={t._id} value={t.teamNumber}>
                TEAM {String(t.teamNumber).padStart(2, '0')} · {t.ideaTitle}
              </option>
            ))}
          </select>
          <Button variant="gold" onClick={start} disabled={busy || !pick}>{busy ? 'Starting…' : 'Start feedback'}</Button>
        </div>
        <p className="font-mono text-[11px] opacity-60">Starting closes any previous session. Same QR now represents the new team. Closed feedback stays below.</p>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display font-bold">Team feedback history</h3>
          <Button variant="gold" onClick={downloadAll} disabled={exportingAll || grouped.length === 0} className="!py-2 !px-4 !text-[11px]">
            <i className="fa-solid fa-download" /> {exportingAll ? 'Preparing…' : 'Merge all & Download Excel'}
          </Button>
        </div>
        {grouped.length === 0 ? (
          <Card hairline><p className="font-mono text-xs opacity-60">No sessions yet. Start Team 1 above.</p></Card>
        ) : (
          grouped.map((g) => {
            const isOpen = String(selectedTeam) === String(g.teamNumber);
            const details = isOpen ? results : null;
            return (
              <Card
                key={g.teamNumber}
                hairline
                className={`space-y-3 ${isOpen ? '!border-gold-500/60' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                  <div>
                    <div className="font-display font-extrabold text-lg">
                      TEAM {String(g.teamNumber).padStart(2, '0')} · {g.ideaTitle || ''}
                    </div>
                    <div className="font-mono text-[11px] opacity-60">
                      {g.hasActive ? 'ACTIVE' : 'CLOSED'} · {g.responses} responses · {g.sessions.length} session{g.sessions.length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => review(g.teamNumber)} className="!py-2 !px-4 !text-[11px]">
                    {isOpen ? 'Hide feedback' : 'View feedback'}
                  </Button>
                </div>

                {isOpen && (
                  <div className="flex flex-col md:flex-row gap-4 pt-2 border-t border-black/10 dark:border-white/10">
                    <div className="md:w-64 shrink-0 space-y-3 md:border-r md:border-black/10 md:dark:border-white/10 md:pr-4 pt-3">
                      <div className="font-mono text-[11px] uppercase opacity-60">Options</div>
                      <Button
                        variant="gold"
                        onClick={() => downloadExcel(g.teamNumber)}
                        disabled={exportingTeam === String(g.teamNumber)}
                        className="w-full !py-2.5 !text-[11px]"
                      >
                        <i className="fa-solid fa-download" /> {exportingTeam === String(g.teamNumber) ? 'Preparing…' : 'Download Excel'}
                      </Button>
                      <div className="font-mono text-[11px] opacity-60">
                        Whole feedback for this team in single file · opens in Excel
                      </div>
                      {details && details.averages && (
                        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                          {Object.entries(details.averages).map(([k, v]) => (
                            <div key={k} className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-2">
                              <div className="opacity-60 uppercase text-[10px]">{k}</div>
                              <div className="font-bold text-base">{v}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2 max-h-96 overflow-y-auto pt-3">
                      <div className="font-mono text-[11px] uppercase opacity-60">
                        All feedback · {details ? details.total : s.responses} responses
                      </div>
                      {(details && details.items ? details.items : []).map((f) => (
                        <div key={f._id} className="rounded-xl border border-black/10 dark:border-white/10 p-3 text-xs space-y-1">
                          <div className="font-mono opacity-60">
                            {new Date(f.createdAt).toLocaleString('en-IN')} · {[f.ratings.innovation, f.ratings.clarity, f.ratings.solution, f.ratings.market, f.ratings.feasibility, f.ratings.presentation].join('/')}
                            {f.reviewerRole === 'audience'
                              ? ` · AUDIENCE${f.audienceName ? ` · ${f.audienceName}` : ''}${f.audiencePrn ? ` · ${f.audiencePrn}` : ''}`
                              : `${f.reviewerTeamNumber != null ? ` · TEAM ${String(f.reviewerTeamNumber).padStart(2, '0')}` : ''}${f.reviewerRole ? ` · ${f.reviewerRole}` : ''}`}
                          </div>
                          {f.likedMost && <div><b>Liked:</b> {f.likedMost}</div>}
                          {f.improve && <div><b>Improve:</b> {f.improve}</div>}
                          {f.wouldUse && <div><b>Would use:</b> {f.wouldUse}</div>}
                        </div>
                      ))}
                      {details && (details.items || []).length === 0 && <p className="font-mono text-xs opacity-60">No responses yet.</p>}
                      {!details && <p className="font-mono text-xs opacity-60">Loading…</p>}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
