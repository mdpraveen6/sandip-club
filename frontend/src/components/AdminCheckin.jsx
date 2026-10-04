import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../lib/api';

export const checkinQrUrl = () => {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/checkin`;
};

export const CheckinTab = ({ notify }) => {
  const [status, setStatus] = useState(null);
  const [teams, setTeams] = useState({ checkedIn: [], pending: [] });
  const [loading, setLoading] = useState(true);
  const [fullQr, setFullQr] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([api.checkinStatus(), api.checkinTeams()]);
      setStatus(s);
      setTeams(t);
    } catch (e) {
      notify('error', e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doManual = async (t) => {
    if (!window.confirm(`Check in "${t.ideaTitle}" now? It will get TEAM ${String(status?.nextTeamNumber ?? '?').padStart(2, '0')}.`)) return;
    setBusyId(t._id);
    try {
      const d = await api.checkinManual(t._id);
      notify('ok', `Checked in as TEAM ${String(d.teamNumber).padStart(2, '0')}`);
      load();
    } catch (e) { notify('error', e.message); }
    setBusyId(null);
  };

  const doUndo = async (t) => {
    if (!window.confirm(`Undo check-in of TEAM ${String(t.teamNumber).padStart(2, '0')} · ${t.ideaTitle}? Teams above will shift down (TEAM ${String(t.teamNumber + 1).padStart(2, '0')} → TEAM ${String(t.teamNumber).padStart(2, '0')}).`)) return;
    setBusyId(t._id);
    try {
      const d = await api.checkinUndo(t._id);
      notify('ok', d.shifted?.length ? `Undone — ${d.shifted.length} team(s) shifted up` : 'Check-in undone — moved back to pending');
      load();
    } catch (e) { notify('error', e.message); }
    setBusyId(null);
  };

  const doDelete = async (t) => {
    const label = t.teamNumber != null ? `TEAM ${String(t.teamNumber).padStart(2, '0')} · ${t.ideaTitle}` : t.ideaTitle;
    if (!window.confirm(`Permanently DELETE "${label}"? This cannot be undone.${t.teamNumber != null ? ' Teams above will shift down immediately.' : ''}`)) return;
    setBusyId(t._id);
    try {
      const d = await api.checkinDeleteTeam(t._id);
      notify('ok', d.shifted?.length ? `Deleted — ${d.shifted.length} team(s) shifted up` : 'Deleted');
      load();
    } catch (e) { notify('error', e.message); }
    setBusyId(null);
  };

  const url = typeof window !== 'undefined' ? checkinQrUrl() : '';

  if (fullQr) {
    return (
      <div className="fixed inset-0 z-[100] bg-ink-950 text-white flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="font-mono text-xs tracking-[0.25em] uppercase opacity-70">Team Heads — Scan to check in</div>
        <div className="bg-white p-6 rounded-3xl">
          <QRCodeSVG value={url} size={320} />
        </div>
        <div className="font-mono text-sm break-all opacity-70">{url}</div>
        <Button variant="gold" onClick={() => setFullQr(false)}>Close</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-4 gap-3">
        <Card className="!p-4"><div className="font-display text-2xl font-extrabold">{status ? status.totalRegistered : '—'}</div><div className="font-mono text-[10px] uppercase opacity-60">Registered</div></Card>
        <Card className="!p-4"><div className="font-display text-2xl font-extrabold">{status ? status.checkedIn : '—'}</div><div className="font-mono text-[10px] uppercase opacity-60">Checked in</div></Card>
        <Card className="!p-4"><div className="font-display text-2xl font-extrabold">{status ? status.notCheckedIn : '—'}</div><div className="font-mono text-[10px] uppercase opacity-60">Not checked in</div></Card>
        <Card className="!p-4"><div className="font-display text-2xl font-extrabold">{status ? `TEAM ${String(status.nextTeamNumber).padStart(2, '0')}` : '—'}</div><div className="font-mono text-[10px] uppercase opacity-60">Next number</div></Card>
      </div>

      <Card hairline className="space-y-4 text-center">
        <h3 className="font-display font-bold text-lg">EVENT CHECK-IN QR</h3>
        <p className="text-xs opacity-60">Display at entrance. Different from feedback QR.</p>
        <div className="inline-block bg-white p-4 rounded-2xl">
          <QRCodeSVG value={url} size={180} />
        </div>
        <div className="font-mono text-[11px] break-all opacity-60">{url}</div>
        <div className="flex gap-2 justify-center flex-wrap">
          <Button variant="gold" onClick={() => setFullQr(true)}>Show full screen QR</Button>
          <Button variant="outline" onClick={load}>Refresh</Button>
          <Button variant="outline" onClick={async () => {
            if (!window.confirm('Repair team-number index? Fixes E11000 { teamNumber: null } on Excel import. Safe to run once.')) return;
            try { const d = await api.checkinFixIndexes(); notify('ok', `Index fixed — unset ${d.unsetNulls} nulls`); load(); }
            catch (e) { notify('error', e.message); }
          }}>Fix import index</Button>
        </div>
        {status && <div className="font-mono text-xs opacity-70">Checked In: {status.checkedIn} / {status.totalRegistered}</div>}
      </Card>

      {loading ? (
        <p className="font-mono text-xs opacity-60 text-center py-6">Loading…</p>
      ) : (
        <div className="space-y-3">
          {teams.checkedIn.map((t) => (
            <Card key={t._id} className="!p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-display font-extrabold">TEAM {String(t.teamNumber).padStart(2, '0')} · {t.ideaTitle}</div>
                <div className="font-mono text-[11px] opacity-60">{t.fullName} · ✓ Checked In · {t.checkedInAt ? new Date(t.checkedInAt).toLocaleString('en-IN') : ''}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hidden sm:inline-block">✓</span>
                <button disabled={busyId === t._id} onClick={() => doUndo(t)} title="Undo check-in (keep registration, free the slot)"
                  className="px-3 py-1.5 rounded-full font-mono text-[11px] font-bold border border-black/10 dark:border-white/15 opacity-70 hover:opacity-100 hover:border-gold-500 transition disabled:opacity-40">
                  ↩ Undo
                </button>
                <button disabled={busyId === t._id} onClick={() => doDelete(t)} title="Permanently delete registration"
                  className="w-8 h-8 rounded-full border border-black/10 dark:border-white/15 text-xs opacity-60 hover:opacity-100 hover:text-rose-500 hover:border-rose-500 transition disabled:opacity-40">
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </Card>
          ))}
          {teams.pending.length > 0 && (
            <div className="font-mono text-[11px] uppercase opacity-60 pt-2">Not checked in ({teams.pending.length})</div>
          )}
          {teams.pending.map((t) => (
            <Card key={t._id} className="!p-4 flex items-center justify-between gap-3 opacity-90">
              <div className="min-w-0">
                <div className="font-display font-bold">{t.ideaTitle}</div>
                <div className="font-mono text-[11px] opacity-60">{t.fullName} · pending</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button disabled={busyId === t._id} onClick={() => doManual(t)} title={`Check in now as TEAM ${String(status?.nextTeamNumber ?? '?').padStart(2, '0')}`}
                  className="px-3 py-1.5 rounded-full font-mono text-[11px] font-bold border border-emerald-500/50 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10 transition disabled:opacity-40">
                  ✓ Check-in
                </button>
                <button disabled={busyId === t._id} onClick={() => doDelete(t)} title="Delete registration"
                  className="w-8 h-8 rounded-full border border-black/10 dark:border-white/15 text-xs opacity-60 hover:opacity-100 hover:text-rose-500 hover:border-rose-500 transition disabled:opacity-40">
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
