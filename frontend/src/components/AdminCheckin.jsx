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
        <div className="flex gap-2 justify-center">
          <Button variant="gold" onClick={() => setFullQr(true)}>Show full screen QR</Button>
          <Button variant="outline" onClick={load}>Refresh</Button>
        </div>
        {status && <div className="font-mono text-xs opacity-70">Checked In: {status.checkedIn} / {status.totalRegistered}</div>}
      </Card>

      {loading ? (
        <p className="font-mono text-xs opacity-60 text-center py-6">Loading…</p>
      ) : (
        <div className="space-y-3">
          {teams.checkedIn.map((t) => (
            <Card key={t._id} className="!p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-display font-extrabold">TEAM {String(t.teamNumber).padStart(2, '0')} · {t.ideaTitle}</div>
                <div className="font-mono text-[11px] opacity-60">{t.fullName} · ✓ Checked In · {t.checkedInAt ? new Date(t.checkedInAt).toLocaleString('en-IN') : ''}</div>
              </div>
              <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">✓</span>
            </Card>
          ))}
          {teams.pending.length > 0 && (
            <div className="font-mono text-[11px] uppercase opacity-60 pt-2">Not checked in ({teams.pending.length})</div>
          )}
          {teams.pending.map((t) => (
            <Card key={t._id} className="!p-4 opacity-70">
              <div className="font-display font-bold">{t.ideaTitle}</div>
              <div className="font-mono text-[11px] opacity-60">{t.fullName} · pending</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
