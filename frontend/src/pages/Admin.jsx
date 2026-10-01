import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api, apiBase, getToken, setToken, clearToken, photoUrl } from '../lib/api';

const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return String(iso); }
};
const toInput = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  } catch { return ''; }
};

const REG_STATUS = [
  { v: 'pending', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { v: 'shortlisted', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30' },
  { v: 'rejected', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  { v: 'accepted', cls: 'bg-gold-500/10 text-gold-600 dark:text-gold-300 border-gold-500/30' },
];
const EV_STATUS = [
  { v: 'upcoming', cls: 'bg-gold-500/10 text-gold-600 dark:text-gold-300 border-gold-500/30' },
  { v: 'ongoing', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30' },
  { v: 'completed', cls: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30' },
];
const pill = (v, list) => {
  const f = list.find((x) => x.v === v);
  return <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase border whitespace-nowrap ${f ? f.cls : ''}`}>{v}</span>;
};

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="field-label">{label}</label>
    {children}
  </div>
);

const deckHref = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('/uploads/')) return `${apiBase}${u}`;
  return null;
};

/* ================= REGISTRATIONS ================= */
const RegistrationsTab = ({ notify, canManage, canRemove }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [notesId, setNotesId] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const d = await api.listRegistrations({ search, status, page: p, limit: 25 });
      setItems(d.items); setTotal(d.total); setPage(d.page); setPages(d.pages);
    } catch (e) { notify('error', e.message); }
    setLoading(false);
  };
  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [status]);

  const setStatusOf = async (id, s) => {
    try { await api.updateRegistration(id, { status: s }); notify('ok', 'Status updated'); load(); }
    catch (e) { notify('error', e.message); }
  };
  const saveNotes = async (r) => {
    try {
      await api.updateRegistration(r._id, { notes: notesId === r._id ? notesDraft : (r.notes || '') });
      notify('ok', 'Notes saved'); setNotesId(null); load();
    } catch (e) { notify('error', e.message); }
  };
  const acceptOne = async (r) => {
    if (!window.confirm(`Accept ${r.fullName}? This issues the Founder Pass and emails it to ${r.email}.`)) return;
    setAcceptingId(r._id);
    try {
      const d = await api.acceptRegistration(r._id);
      notify('ok', `Accepted · Pass ${d.registration.passRef}` + (d.emailSent ? ' · email sent' : ` · email NOT sent (${d.emailError || 'SMTP not configured'})`));
      load();
    } catch (e) { notify('error', e.message); }
    setAcceptingId(null);
  };
  const resendOne = async (r) => {
    try {
      const d = await api.resendPass(r._id);
      notify(d.emailSent ? 'ok' : 'error', d.emailSent ? 'Pass email re-sent' : `Email failed: ${d.emailError || 'SMTP not configured'}`);
    } catch (e) { notify('error', e.message); }
  };
  const remove = async (id, name) => {
    if (!window.confirm(`Delete registration of ${name}?`)) return;
    try { await api.deleteRegistration(id); notify('ok', 'Deleted'); load(); }
    catch (e) { notify('error', e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(1)}
            placeholder="Search name, email, PRN, idea…" className="field max-w-sm" />
          <Button variant="outline" onClick={() => load(1)}>Search</Button>
        </div>
        <div className="flex gap-2 items-center">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="field !w-auto">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="gold" onClick={() => api.exportRegistrations().catch((e) => notify('error', e.message))}>
            <i className="fa-solid fa-download" /> CSV ({total})
          </Button>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1080px]">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-wider opacity-60 border-b border-black/10 dark:border-white/10">
                <th className="px-4 py-3 font-bold w-[20%]">Founder</th>
                <th className="px-4 py-3 font-bold w-[24%]">Idea &amp; deck</th>
                <th className="px-4 py-3 font-bold w-[18%]">Contact</th>
                <th className="px-4 py-3 font-bold w-[14%]">School</th>
                <th className="px-4 py-3 font-bold">Applied</th>
                <th className="px-4 py-3 font-bold">Pass</th>
                <th className="px-4 py-3 font-bold">Review</th>
                <th className="px-4 py-3 font-bold" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center opacity-60">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center opacity-60">No registrations yet. Share the Register page to get the first one.</td></tr>
              ) : items.map((r) => (
                <React.Fragment key={r._id}>
                  <tr className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] align-top">
                    <td className="px-4 py-3">
                      <div className="font-display font-bold whitespace-nowrap">{r.fullName}</div>
                      <div className="font-mono text-[11px] opacity-60 whitespace-nowrap">{r.prn} · {r.teamType}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold truncate max-w-[220px]" title={r.ideaTitle}>{r.ideaTitle}</div>
                      <div className="font-mono text-[11px] opacity-60">{r.domain}</div>
                      {deckHref(r.pitchDeckUrl) ? (
                        <a href={deckHref(r.pitchDeckUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-1 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-300 hover:text-gold-500 transition">
                          <i className="fa-solid fa-file-arrow-down" /> View deck
                        </a>
                      ) : (
                        <div className="font-mono text-[11px] opacity-40 mt-1">{r.pitchDeckUrl ? r.pitchDeckUrl : 'No deck attached'}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <div className="truncate max-w-[190px]" title={r.email}>{r.email}</div>
                      <div className="opacity-60">{r.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="truncate max-w-[150px] opacity-80" title={r.school}>{r.school}</div>
                      <div className="opacity-60">{r.academicYear}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap opacity-70">{fmtDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      {r.passRef ? (
                        <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold whitespace-nowrap bg-gold-500/10 text-gold-600 dark:text-gold-300 border border-gold-500/30">{r.passRef}</span>
                      ) : (
                        <span className="font-mono text-[11px] opacity-40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setExpandedId(expandedId === r._id ? null : r._id); setNotesId(null); }}
                        className={`w-9 h-9 rounded-full border transition flex items-center justify-center ${expandedId === r._id ? 'bg-gradient-gold text-[#1A1405] border-transparent' : 'border-black/10 dark:border-white/15 opacity-70 hover:opacity-100 hover:border-gold-500/60'}`}
                        title="Review application">
                        <i className={`fa-solid ${expandedId === r._id ? 'fa-chevron-up' : 'fa-magnifying-glass'} text-xs`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canRemove && (
                        <button onClick={() => remove(r._id, r.fullName)} className="w-8 h-8 rounded-full border border-black/10 dark:border-white/15 text-xs opacity-60 hover:opacity-100 hover:text-rose-500 hover:border-rose-500 transition" title="Delete">
                          <i className="fa-solid fa-trash" />
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === r._id && (
                    <tr key={`${r._id}-x`} className="border-b border-gold-500/20 bg-gold-500/[0.04]">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="rounded-xl border border-gold-500/30 bg-gold-500/[0.05] p-3.5 mb-3">
                          <div className="field-label mb-2">Attached document — review before accepting</div>
                          {deckHref(r.pitchDeckUrl) ? (
                            <div className="space-y-2.5">
                              {/\.pdf($|\?)/i.test(deckHref(r.pitchDeckUrl)) ? (
                                <iframe src={deckHref(r.pitchDeckUrl)} title={`Deck of ${r.fullName}`} className="w-full h-[440px] rounded-lg bg-white border border-black/10 dark:border-white/10" />
                              ) : (
                                <div className="flex items-center gap-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 px-4 py-3">
                                  <i className="fa-solid fa-file-powerpoint text-2xl text-gold-600 dark:text-gold-300" />
                                  <div className="min-w-0">
                                    <div className="font-bold text-sm truncate">{String(r.pitchDeckUrl).split('/').pop()}</div>
                                    <div className="font-mono text-[11px] opacity-60">In-browser preview works for PDFs — open this file below</div>
                                  </div>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <a href={deckHref(r.pitchDeckUrl)} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full font-mono text-[11px] font-bold border border-black/10 dark:border-white/15 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-300 transition inline-flex items-center gap-1.5">
                                  <i className="fa-solid fa-arrow-up-right-from-square" /> Open full view
                                </a>
                                <a href={deckHref(r.pitchDeckUrl)} download className="px-4 py-2 rounded-full font-mono text-[11px] font-bold border border-black/10 dark:border-white/15 hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-300 transition inline-flex items-center gap-1.5">
                                  <i className="fa-solid fa-download" /> Download
                                </a>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                              <i className="fa-solid fa-triangle-exclamation mr-1.5" />
                              {r.pitchDeckUrl
                                ? `Attached as filename only (“${r.pitchDeckUrl}”) — the file itself was never uploaded.`
                                : 'No document attached — ask the founder for a deck before accepting.'}
                            </p>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="rounded-xl border border-black/10 dark:border-white/10 p-3.5">
                            <div className="field-label mb-1.5">Problem statement</div>
                            <p className="text-sm opacity-85 leading-relaxed">{r.problemStatement}</p>
                          </div>
                          <div className="rounded-xl border border-black/10 dark:border-white/10 p-3.5">
                            <div className="field-label mb-1.5">Proposed solution</div>
                            <p className="text-sm opacity-85 leading-relaxed">{r.solutionOverview}</p>
                          </div>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-3 mt-3 lg:items-end">
                          <div className="flex-1 space-y-1.5">
                            <label className="field-label">Admin notes (private)</label>
                            <input
                              value={notesId === r._id ? notesDraft : (r.notes || '')}
                              onChange={(e) => { setNotesId(r._id); setNotesDraft(e.target.value); }}
                              className="field" placeholder="Internal remark…" />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <select value={r.status} disabled={!canManage} onChange={(e) => setStatusOf(r._id, e.target.value)} className="field !w-auto !py-2.5">
                              <option value="pending">pending</option>
                              <option value="shortlisted">shortlisted</option>
                              <option value="accepted">accepted</option>
                              <option value="rejected">rejected</option>
                            </select>
                            <Button variant="outline" disabled={!canManage} onClick={() => saveNotes(r)} className="!py-2.5 !px-4 !text-[11px]">Save notes</Button>
                            {r.status !== 'accepted' ? (
                              <Button variant="gold" disabled={acceptingId === r._id || !canManage} onClick={() => acceptOne(r)} className="!py-2.5 !px-5 !text-[11px]">
                                <i className="fa-solid fa-stamp" /> {acceptingId === r._id ? 'Issuing…' : 'Accept & issue pass'}
                              </Button>
                            ) : (
                              <Button variant="outline" disabled={!canManage} onClick={() => resendOne(r)} className="!py-2.5 !px-5 !text-[11px]">
                                <i className="fa-solid fa-envelope" /> Resend mail
                              </Button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between font-mono text-xs opacity-70">
        <span>Total {total} · Page {page}/{pages}</span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => page > 1 && load(page - 1)} className="!px-4 !py-2">← Prev</Button>
          <Button variant="outline" onClick={() => page < pages && load(page + 1)} className="!px-4 !py-2">Next →</Button>
        </div>
      </div>
    </div>
  );
};

/* ================= EVENTS ================= */
const emptyEvent = { title: '', edition: '', category: '', description: '', venue: '', timeLabel: '', eventDate: '', status: 'upcoming', maxSeats: '', imageUrl: '', order: 0, isPublished: true };

const EventsTab = ({ notify, canManage, canRemove }) => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEvent);
  const [busy, setBusy] = useState(false);
  const [rsvpFor, setRsvpFor] = useState(null);
  const [rsvps, setRsvps] = useState([]);

  const load = async () => {
    try { const d = await api.eventsAll(); setItems(d.items); }
    catch (e) { notify('error', e.message); }
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing('new'); setForm(emptyEvent); setRsvpFor(null); };
  const startEdit = (ev) => {
    setEditing(ev._id); setRsvpFor(null);
    setForm({
      title: ev.title || '', edition: ev.edition || '', category: ev.category || '',
      description: ev.description || '', venue: ev.venue || '', timeLabel: ev.timeLabel || '',
      eventDate: toInput(ev.eventDate), status: ev.status || 'upcoming',
      maxSeats: ev.maxSeats ?? '', imageUrl: ev.imageUrl || '', order: ev.order ?? 0,
      isPublished: ev.isPublished !== false,
    });
  };
  const save = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.description.trim()) {
      notify('error', 'Title, category and description are required'); return;
    }
    setBusy(true);
    try {
      const payload = { ...form, eventDate: form.eventDate || null, maxSeats: form.maxSeats === '' ? null : Number(form.maxSeats) };
      if (editing === 'new') await api.createEvent(payload);
      else await api.updateEvent(editing, payload);
      notify('ok', 'Event saved'); setEditing(null); load();
    } catch (e) { notify('error', e.message); }
    setBusy(false);
  };
  const remove = async (id, title) => {
    if (!window.confirm(`Delete "${title}" and its RSVPs?`)) return;
    try { await api.deleteEvent(id); notify('ok', 'Deleted'); load(); }
    catch (e) { notify('error', e.message); }
  };
  const viewRsvps = async (ev) => {
    if (rsvpFor === ev._id) { setRsvpFor(null); return; }
    try { const d = await api.eventRsvps(ev._id); setRsvps(d.items); setRsvpFor(ev._id); }
    catch (e) { notify('error', e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="font-mono text-xs opacity-60">{items.length} events · status drives the Upcoming / Ongoing / Completed tabs</p>
        {canManage && (<Button variant="gold" onClick={startNew}><i className="fa-solid fa-plus" /> New event</Button>)}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card hairline className="space-y-4">
              <h3 className="font-display font-bold text-lg">{editing === 'new' ? 'New event' : 'Edit event'}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Title *"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="field" placeholder="e.g. Pitch Night #3" /></Field>
                <Field label="Edition"><input value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} className="field" placeholder="SUN Launchpad 2026" /></Field>
                <Field label="Category *"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="field" placeholder="Pitch Competition" /></Field>
                <Field label="Venue"><input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="field" placeholder="Main Auditorium" /></Field>
                <Field label="Time label"><input value={form.timeLabel} onChange={(e) => setForm({ ...form, timeLabel: e.target.value })} className="field" placeholder="6 PM onwards" /></Field>
                <Field label="Date & time"><input type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="field" /></Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="field">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </Field>
                <Field label="Max seats (empty = unlimited)"><input type="number" min="1" value={form.maxSeats} onChange={(e) => setForm({ ...form, maxSeats: e.target.value })} className="field" placeholder="e.g. 50" /></Field>
                <Field label="Image URL"><input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="field" placeholder="https://…" /></Field>
                <Field label="Order"><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="field" /></Field>
              </div>
              <Field label="Description *"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field" /></Field>
              <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 accent-emerald-600" />
                Published (visible on Events page)
              </label>
              <div className="flex gap-2">
                <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save event'}</Button>
                <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((ev) => (
          <Card key={ev._id} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              {pill(ev.status, EV_STATUS)}
              <span className={`font-mono text-[10px] font-bold uppercase ${ev.isPublished ? 'text-emerald-500' : 'opacity-50'}`}>
                {ev.isPublished ? '● live' : '○ draft'}
              </span>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] opacity-45">{(ev.edition || '').toUpperCase()}</div>
              <h3 className="font-display font-bold text-lg leading-snug">{ev.title}</h3>
              <p className="text-sm opacity-70 mt-1">{ev.category} · {ev.timeLabel || fmtDate(ev.eventDate)}</p>
            </div>
            <div className="font-mono text-[11px] opacity-70">
              {ev.maxSeats ? `${ev.seatsTaken}/${ev.maxSeats} registered${ev.seatsLeft === 0 ? ' — FULL' : ''}` : `${ev.seatsTaken} registered · unlimited`}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" disabled={!canManage} onClick={() => startEdit(ev)} className="!py-2 !px-4 !text-[11px]">Edit</Button>
              <Button variant="outline" onClick={() => viewRsvps(ev)} className="!py-2 !px-4 !text-[11px]">
                RSVPs ({ev.seatsTaken})
              </Button>
              {canRemove && (
                <button onClick={() => remove(ev._id, ev.title)} className="px-4 py-2 rounded-full font-mono text-[11px] font-bold border border-black/10 dark:border-white/15 opacity-60 hover:opacity-100 hover:text-rose-500 hover:border-rose-500 transition">
                  Delete
                </button>
              )}
            </div>
            {rsvpFor === ev._id && (
              <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 max-h-48 overflow-y-auto space-y-1.5 text-xs font-mono">
                {rsvps.length === 0 ? <span className="opacity-60">No RSVPs yet.</span> : rsvps.map((r) => (
                  <div key={r._id} className="flex justify-between gap-2">
                    <span>{r.name} · {r.email}</span>
                    <span className="opacity-50">{fmtDate(r.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ================= TEAM ================= */
const emptyMember = { name: '', role: '', category: '', year: '', branch: '', bio: '', photoUrl: '', tags: '', socials: [], order: 0, isActive: true, sourceRegistrationId: null };
const SOCIAL_LABELS = ['LinkedIn', 'GitHub', 'Portfolio', 'Website', 'Instagram', 'Other'];

const PERM_ROWS = [['registrations', 'Registrations'], ['events', 'Events'], ['team', 'Team']];
const PERM_COLS = [['view', 'View'], ['manage', 'Create & edit'], ['remove', 'Delete']];
const freshPerms = () => ({
  registrations: { view: true, manage: false, remove: false },
  events: { view: true, manage: false, remove: false },
  team: { view: true, manage: false, remove: false },
});

const PermMatrix = ({ value, onChange }) => (
  <div className="space-y-2">
    {PERM_ROWS.map(([m, label]) => (
      <div key={m} className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-black/10 dark:border-white/10 px-4 py-3">
        <span className="font-mono text-xs font-bold uppercase w-32">{label}</span>
        {PERM_COLS.map(([k, l]) => (
          <label key={k} className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={!!(value && value[m] && value[m][k])} onChange={(e) => onChange(m, k, e.target.checked)} className="w-4 h-4 accent-emerald-600" /> {l}
          </label>
        ))}
      </div>
    ))}
  </div>
);

const TeamTab = ({ notify, canManage, canRemove }) => {
  const [items, setItems] = useState([]);
  const [pending, setPending] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyMember);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try { const d = await api.teamAll(); setItems(d.items); }
    catch (e) { notify('error', e.message); }
    try { const p = await api.pendingTeam(); setPending(p.items); }
    catch { setPending([]); }
  };
  useEffect(() => { load(); }, []);
  const categories = [...new Set(items.map((m) => m.category).filter(Boolean))];

  const startNew = () => { setEditing('new'); setForm({ ...emptyMember, order: items.length }); };
  const startEdit = (m) => {
    setEditing(m._id);
    setForm({
      name: m.name || '', role: m.role || '', category: m.category || '', year: m.year || '',
      branch: m.branch || '', bio: m.bio || '', photoUrl: m.photoUrl || '',
      tags: (m.tags || []).join(', '), socials: (m.socials || []).map((s) => ({ ...s })), order: m.order ?? 0,
      isActive: m.isActive !== false, sourceRegistrationId: m.sourceRegistrationId || null,
    });
  };
  // Fill the editor from an approved registration (name/email/idea pre-mapped).
  const addFromRegistration = (r) => {
    setEditing('new');
    setForm({
      name: r.fullName || '', role: '', category: '',
      year: r.academicYear || '', branch: r.school || '',
      bio: [r.ideaTitle, r.problemStatement].filter(Boolean).join(' — ').slice(0, 600),
      photoUrl: '', tags: r.domain ? [r.domain].join(', ') : '', socials: [],
      order: items.length, isActive: true, sourceRegistrationId: r._id,
    });
    setTimeout(() => document.getElementById('team-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };
  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      const d = await api.uploadPhoto(f);
      setForm((p) => ({ ...p, photoUrl: d.url }));
      notify('ok', 'Photo uploaded');
    } catch (err) { notify('error', err.message); }
    setUploading(false);
  };
  const save = async () => {
    if (!form.name.trim() || !form.role.trim() || !form.category.trim()) {
      notify('error', 'Name, role and category are required'); return;
    }
    setBusy(true);
    try {
      if (editing === 'new') await api.createMember(form);
      else await api.updateMember(editing, form);
      notify('ok', 'Member saved'); setEditing(null); load();
    } catch (e) { notify('error', e.message); }
    setBusy(false);
  };
  const remove = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the team?`)) return;
    try { await api.deleteMember(id); notify('ok', 'Removed'); load(); }
    catch (e) { notify('error', e.message); }
  };

  return (
    <div className="space-y-5">
      {pending.length > 0 && (
        <Card hairline className="!border-gold-500/50 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute w-full h-full rounded-full bg-gold-400 animate-ping" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-gold-400" />
            </span>
            <h3 className="font-display font-bold">
              {pending.length} approved founder{pending.length > 1 ? 's' : ''} not on the team yet
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {pending.map((r) => (
              <div key={r._id} className="rounded-2xl overflow-hidden border border-gold-500/30 bg-ink-950 text-white">
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-gold-400 to-emerald-500" />
                <div className="p-4 space-y-1 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold tracking-[0.18em] text-gold-300">FOUNDER PASS</span>
                    <span className="text-emerald-300">● APPROVED</span>
                  </div>
                  <p className="font-display font-bold text-base text-white pt-1">{r.fullName}</p>
                  <p className="opacity-70">{r.email}</p>
                  <p className="opacity-70 truncate" title={r.ideaTitle}>{r.ideaTitle}</p>
                  <p>REF <span className="text-gold-300 font-bold">{r.passRef}</span></p>
                  <Button variant="gold" onClick={() => addFromRegistration(r)} className="w-full !py-2.5 !text-[11px] !mt-2">
                    Add to team with these details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <p className="font-mono text-xs opacity-60">{items.length} members · order decides display sequence</p>
        {canManage && (<Button variant="gold" onClick={startNew}><i className="fa-solid fa-plus" /> Add member</Button>)}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div id="team-editor" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card hairline className="space-y-4">
              <h3 className="font-display font-bold text-lg">{editing === 'new' ? 'Add member' : 'Edit member'}</h3>
              {form.sourceRegistrationId && (
                <p className="font-mono text-[11px] px-3 py-2 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-300 border border-gold-500/30">
                  Prefilled from an approved registration — saving links it and clears the alert above.
                </p>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name *"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" /></Field>
                <Field label="Title / Role *"><input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="field" placeholder="Technical Team Head" /></Field>
                <Field label="Category *">
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="field" list="team-cats" placeholder="Technical" />
                  <datalist id="team-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </Field>
                <Field label="Year"><input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="field" placeholder="3rd Year" /></Field>
                <Field label="Branch"><input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="field" /></Field>
                <Field label="Order"><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="field" /></Field>
              </div>
              <Field label="Description"><textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="field" /></Field>
              <Field label="Tags (comma separated)">
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="field" placeholder="Lead, React, Design" />
              </Field>
              <div className="space-y-2">
                <label className="field-label">Photo — upload or paste URL</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  {(form.photoUrl) && (
                    <img src={photoUrl(form.photoUrl)} alt="preview" className="w-16 h-16 rounded-2xl object-cover border border-black/10 dark:border-white/15" />
                  )}
                  <input type="file" accept="image/*" onChange={onFile} className="field" />
                  <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} className="field" placeholder="https://… or /uploads/…" />
                </div>
                {uploading && <p className="font-mono text-xs opacity-60">Uploading…</p>}
              </div>
              <div className="space-y-2">
                <label className="field-label">Social links (multiple)</label>
                {form.socials.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <select value={s.label} onChange={(e) => setForm((p) => ({ ...p, socials: p.socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }))} className="field !w-36">
                      {SOCIAL_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <input value={s.url} onChange={(e) => setForm((p) => ({ ...p, socials: p.socials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) }))} className="field" placeholder="https://…" />
                    <button onClick={() => setForm((p) => ({ ...p, socials: p.socials.filter((_, j) => j !== i) }))} className="shrink-0 w-11 rounded-xl border border-black/10 dark:border-white/15 opacity-60 hover:opacity-100 hover:text-rose-500 transition" title="Remove">
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ))}
                <button onClick={() => setForm((p) => ({ ...p, socials: [...p.socials, { label: 'LinkedIn', url: '' }] }))} className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-300 hover:opacity-80">
                  + Add social link
                </button>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-emerald-600" />
                Visible on Team page
              </label>
              <div className="flex gap-2">
                <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save member'}</Button>
                <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((m) => (
          <Card key={m._id} className={`space-y-3 ${m.isActive ? '' : 'opacity-60'}`}>
            <div className="flex items-center gap-3">
              {m.photoUrl ? (
                <img src={photoUrl(m.photoUrl)} alt={m.name} className="w-12 h-12 rounded-2xl object-cover border border-black/10 dark:border-white/15" />
              ) : (
                <span className="w-12 h-12 rounded-2xl bg-gradient-brand text-white font-display font-extrabold flex items-center justify-center">
                  {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <div className="font-display font-bold truncate">{m.name}</div>
                <div className="font-mono text-[10px] uppercase text-gold-600 dark:text-gold-300">{m.role}</div>
              </div>
            </div>
            {(m.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {m.tags.map((t) => (
                  <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">{t}</span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" disabled={!canManage} onClick={() => startEdit(m)} className="!py-1.5 !px-4 !text-[11px]">Edit</Button>
              {canRemove && (
                <button onClick={() => remove(m._id, m.name)} className="px-4 py-1.5 rounded-full font-mono text-[11px] font-bold border border-black/10 dark:border-white/15 opacity-60 hover:opacity-100 hover:text-rose-500 hover:border-rose-500 transition">
                  Delete
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ================= ACCESS (super only) ================= */
const AccessTab = ({ notify }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ email: '', accessStart: '', accessEnd: '', permissions: freshPerms() });
  const [setupInfo, setSetupInfo] = useState(null);
  const [editPerms, setEditPerms] = useState(null);
  const [editId, setEditId] = useState(null);
  const [window_, setWindow] = useState({ accessStart: '', accessEnd: '' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { const d = await api.listAdmins(); setItems(d.items); }
    catch (e) { notify('error', e.message); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.email.trim()) { notify('error', 'Email is required'); return; }
    setBusy(true); setSetupInfo(null);
    try {
      const d = await api.createAdmin({
        email: form.email.trim(),
        accessStart: form.accessStart || null,
        accessEnd: form.accessEnd || null,
        permissions: form.permissions,
      });
      setSetupInfo({ email: d.admin.email, emailSent: d.emailSent, emailError: d.emailError, setupCode: d.setupCode });
      notify('ok', 'Member invited');
      setForm({ email: '', accessStart: '', accessEnd: '', permissions: freshPerms() });
      load();
    } catch (e) { notify('error', e.message); }
    setBusy(false);
  };
  const toggle = async (m) => {
    try { await api.updateAdmin(m._id, { isActive: !m.isActive }); notify('ok', m.isActive ? 'Disabled' : 'Enabled'); load(); }
    catch (e) { notify('error', e.message); }
  };
  const saveWindow = async (id) => {
    try {
      await api.updateAdmin(id, { accessStart: window_.accessStart || null, accessEnd: window_.accessEnd || null, permissions: editPerms || undefined });
      notify('ok', 'Access updated'); setEditId(null); setEditPerms(null); load();
    } catch (e) { notify('error', e.message); }
  };
  const remove = async (id, email) => {
    if (!window.confirm(`Remove admin access for ${email}?`)) return;
    try { await api.deleteAdmin(id); notify('ok', 'Removed'); load(); }
    catch (e) { notify('error', e.message); }
  };
  const windowLabel = (m) => {
    if (!m.accessStart && !m.accessEnd) return 'Unlimited';
    return `${m.accessStart ? fmtDate(m.accessStart) : '…'} → ${m.accessEnd ? fmtDate(m.accessEnd) : '…'}`;
  };

  return (
    <div className="space-y-5">
      <Card hairline className="space-y-4">
        <h3 className="font-display font-bold text-lg">Add member access</h3>
        <p className="text-sm opacity-70">They get an email code and set their <b>own</b> password — you never handle it. Tick exactly what they may touch, plus an optional time window.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Email"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" placeholder="member@sandip.edu.in" /></Field>
          <Field label="Access from (optional)"><input type="datetime-local" value={form.accessStart} onChange={(e) => setForm({ ...form, accessStart: e.target.value })} className="field" /></Field>
          <Field label="Access until (optional)"><input type="datetime-local" value={form.accessEnd} onChange={(e) => setForm({ ...form, accessEnd: e.target.value })} className="field" /></Field>
        </div>
        <div className="space-y-2">
          <label className="field-label">Permissions</label>
          <PermMatrix value={form.permissions} onChange={(m, k, v) => setForm({ ...form, permissions: { ...form.permissions, [m]: { ...form.permissions[m], [k]: v } } })} />
        </div>
        {setupInfo && (
          <div className={`px-4 py-3 rounded-2xl font-mono text-xs border ${setupInfo.emailSent ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30' : 'bg-gold-500/10 text-gold-700 dark:text-gold-300 border-gold-500/30'}`}>
            {setupInfo.emailSent
              ? `Invite email sent to ${setupInfo.email} — they set their own password via the code.`
              : (<span>Email not sent ({setupInfo.emailError || 'SMTP missing'}). Share this one-time setup code manually: <b className="text-base tracking-[0.2em]">{setupInfo.setupCode}</b></span>)}
          </div>
        )}
        <Button variant="gold" onClick={create} disabled={busy}>{busy ? 'Inviting…' : 'Send invite'}</Button>
      </Card>

      <div className="space-y-3">
        {items.map((m) => (
          <Card key={m._id} className={`flex flex-col md:flex-row md:items-center gap-3 justify-between ${m.isActive ? '' : 'opacity-60'}`}>
            <div>
              <div className="font-display font-bold">{m.email}</div>
              <div className="font-mono text-[11px] opacity-70 mt-0.5">
                <i className="fa-solid fa-clock mr-1" /> {windowLabel(m)} · joined {fmtDate(m.createdAt)}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['registrations', 'events', 'team'].map((mod) => {
                  const p = (m.permissions && m.permissions[mod]) || {};
                  const on = ['view', 'manage', 'remove'].filter((a) => p[a]);
                  if (!on.length) return null;
                  return <span key={mod} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">{mod}: {on.join('+')}</span>;
                })}
              </div>
              {editId === m._id && (
                <div className="space-y-3 mt-3">
                  <div className="flex flex-wrap gap-2">
                    <input type="datetime-local" value={window_.accessStart} onChange={(e) => setWindow({ ...window_, accessStart: e.target.value })} className="field !w-auto" />
                    <input type="datetime-local" value={window_.accessEnd} onChange={(e) => setWindow({ ...window_, accessEnd: e.target.value })} className="field !w-auto" />
                    <Button onClick={() => saveWindow(m._id)} className="!py-2 !px-4 !text-[11px]">Save</Button>
                    <Button variant="secondary" onClick={() => { setEditId(null); setEditPerms(null); }} className="!py-2 !px-4 !text-[11px]">Cancel</Button>
                  </div>
                  <div className="space-y-2">
                    <label className="field-label">Permissions</label>
                    <PermMatrix value={editPerms} onChange={(mod, act, v) => setEditPerms({ ...editPerms, [mod]: { ...editPerms[mod], [act]: v } })} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { setEditId(m._id); setWindow({ accessStart: toInput(m.accessStart), accessEnd: toInput(m.accessEnd) }); setEditPerms(m.permissions || freshPerms()); }} className="!py-2 !px-4 !text-[11px]">
                Access
              </Button>
              <Button variant="outline" onClick={() => toggle(m)} className="!py-2 !px-4 !text-[11px]">
                {m.isActive ? 'Disable' : 'Enable'}
              </Button>
              <button onClick={() => remove(m._id, m.email)} className="px-4 py-2 rounded-full font-mono text-[11px] font-bold border border-black/10 dark:border-white/15 opacity-60 hover:opacity-100 hover:text-rose-500 hover:border-rose-500 transition">
                Remove
              </button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="font-mono text-xs opacity-60 text-center py-6">No sub-admins yet.</p>}
      </div>
    </div>
  );
};

/* ================= ACTIVITY (super only) ================= */
const ActivityTab = ({ notify }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [actor, setActor] = useState('');
  const [entity, setEntity] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const d = await api.auditList({ actor, entity, page: p, limit: 50 });
      setItems(d.items); setTotal(d.total); setPage(d.page); setPages(d.pages);
    } catch (e) { notify('error', e.message); }
    setLoading(false);
  };
  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [entity]);

  const actionCls = (a) => (
    a === 'delete' || a === 'login-failed'
      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
      : a === 'create' || a === 'accept'
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
        : a === 'login'
          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30'
          : 'bg-gold-500/10 text-gold-600 dark:text-gold-300 border-gold-500/30'
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex gap-2 flex-1">
          <input value={actor} onChange={(e) => setActor(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(1)}
            placeholder="Search actor email…" className="field max-w-sm" />
          <Button variant="outline" onClick={() => load(1)}>Search</Button>
        </div>
        <select value={entity} onChange={(e) => setEntity(e.target.value)} className="field !w-auto">
          <option value="">All areas</option>
          <option value="registration">Registrations</option>
          <option value="event">Events</option>
          <option value="team">Team</option>
          <option value="admin">Admins</option>
          <option value="auth">Logins</option>
          <option value="rsvp">RSVPs</option>
        </select>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-wider opacity-60 border-b border-black/10 dark:border-white/10">
                <th className="px-4 py-3 font-bold">When</th>
                <th className="px-4 py-3 font-bold">Who</th>
                <th className="px-4 py-3 font-bold">Action</th>
                <th className="px-4 py-3 font-bold">Area</th>
                <th className="px-4 py-3 font-bold">What</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center opacity-60">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center opacity-60">No activity yet — actions appear here as members work.</td></tr>
              ) : items.map((a) => (
                <tr key={a._id} className="border-b border-black/5 dark:border-white/5 align-top">
                  <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap opacity-70">{fmtDate(a.createdAt)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{a.actor}<div className="opacity-50">{a.role}</div></td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase border whitespace-nowrap ${actionCls(a.action)}`}>{a.action}</span></td>
                  <td className="px-4 py-3 font-mono text-xs opacity-70">{a.entity}</td>
                  <td className="px-4 py-3 text-xs opacity-85">{a.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between font-mono text-xs opacity-70">
        <span>Total {total} · Page {page}/{pages}</span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => page > 1 && load(page - 1)} className="!px-4 !py-2">← Prev</Button>
          <Button variant="outline" onClick={() => page < pages && load(page + 1)} className="!px-4 !py-2">Next →</Button>
        </div>
      </div>
    </div>
  );
};

/* ================= SHELL ================= */
export const Admin = ({ navigateTo }) => {
  const [token, setTok] = useState(getToken());
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(!!getToken());
  const [tab, setTab] = useState('registrations');
  const [msg, setMsg] = useState(null);
  const [stats, setStats] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [mode, setMode] = useState('login');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState(null);
  const [codeSent, setCodeSent] = useState(false);

  const notify = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadMe = async (t) => {
    try {
      const d = await api.me();
      setMe(d.admin);
      return true;
    } catch (e) {
      clearToken(); setTok(null); setMe(null);
      setErr(e.message);
      return false;
    }
  };

  useEffect(() => {
    if (token) loadMe(token).finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invite links land on #/admin?setup=1 — open the password form directly.
  useEffect(() => {
    if ((window.location.hash || '').includes('setup')) setMode('reset');
  }, []);

  useEffect(() => {
    if (!me) return;
    (async () => {
      const [r, e, t] = await Promise.all([
        api.listRegistrations({ limit: 1 }).catch(() => null),
        api.eventsAll().catch(() => null),
        api.teamAll().catch(() => null),
      ]);
      let admins = null;
      if (me.role === 'super') {
        try { const d = await api.listAdmins(); admins = d.items.length; } catch { admins = null; }
      }
      const live = e ? e.items.filter((x) => x.isPublished).length : null;
      setStats([
        { label: 'Registrations', value: r ? r.total : '—', icon: 'fa-inbox', tile: 'bg-gradient-brand text-white border-glow' },
        { label: 'Events', value: e ? `${live}/${e.items.length} live` : '—', icon: 'fa-calendar-days', tile: 'bg-gradient-gold text-[#1A1405] border-glow-gold' },
        { label: 'Team', value: t ? t.items.length : '—', icon: 'fa-users', tile: 'bg-ink-950 text-cream-50 dark:bg-cream-50 dark:text-ink-950' },
        me.role === 'super'
          ? { label: 'Sub-admins', value: admins ?? '—', icon: 'fa-key', tile: 'glass-panel text-gold-600 dark:text-gold-300 border border-gold-500/30' }
          : { label: 'Access', value: 'Admin', icon: 'fa-user-shield', tile: 'glass-panel text-emerald-600 dark:text-emerald-300 border border-emerald-500/30' },
      ]);
    })();
  }, [me]);

  const login = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const d = await api.login(email.trim(), password);
      setToken(d.token); setTok(d.token);
      setMe(d.admin); setTab('registrations');
      setEmail(''); setPassword('');
      window.dispatchEvent(new Event('sebc-admin-change'));
    } catch (er) { setErr(er.message); }
    setBusy(false);
  };

  const sendCode = async () => {
    setBusy(true); setResetMsg(null);
    try {
      const d = await api.forgotPassword(email);
      setCodeSent(true);
      setResetMsg({ type: 'ok', text: d.message });
    } catch (er) { setResetMsg({ type: 'error', text: er.message }); }
    setBusy(false);
  };

  const doReset = async (e) => {
    e.preventDefault();
    setBusy(true); setResetMsg(null);
    try {
      const d = await api.resetPassword({ email, code, newPassword });
      setResetMsg({ type: 'ok', text: `${d.message} You can sign in now.` });
      setCode(''); setNewPassword(''); setCodeSent(false);
    } catch (er) { setResetMsg({ type: 'error', text: er.message }); }
    setBusy(false);
  };

  const logout = () => {
    clearToken(); setTok(null); setMe(null);
    window.dispatchEvent(new Event('sebc-admin-change'));
  };

  if (checking) {
    return <div className="py-24 text-center font-mono text-sm opacity-60">Checking session…</div>;
  }

  if (!token || !me) {
    return (
      <div className="max-w-md mx-auto pt-4 sm:pt-6 pb-8">
        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <Card hairline className="!p-8 space-y-5">
            <div className="text-center space-y-2">
              <span className="section-badge"><i className="fa-solid fa-lock text-gold-500" /> Admin access</span>
              <h1 className="font-display text-2xl font-extrabold">SEBC Control Room</h1>
              <p className="text-sm opacity-60">Super admin or time-window member login.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06]">
              {['login', 'reset'].map((m) => (
                <button key={m} type="button" onClick={() => { setMode(m); setErr(''); setResetMsg(null); }}
                  className={`py-2.5 rounded-xl font-display text-[13px] font-bold transition ${mode === m ? 'bg-gradient-gold text-[#1A1405]' : 'opacity-60 hover:opacity-100'}`}>
                  {m === 'login' ? 'Sign in' : 'Set / reset password'}
                </button>
              ))}
            </div>
            {mode === 'login' ? (
              <form onSubmit={login} className="space-y-4">
                <Field label="Email">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="mdpraveen22@gmail.com" />
                </Field>
                <Field label="Password">
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="••••••••" />
                </Field>
                {err && <p className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">{err}</p>}
                <Button type="submit" variant="gold" className="w-full" disabled={busy}>
                  {busy ? 'Signing in…' : 'Sign in'} <i className="fa-solid fa-arrow-right text-xs" />
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Field label="Admin email">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="member@example.com" />
                </Field>
                {!codeSent ? (
                  <Button variant="gold" onClick={sendCode} disabled={busy || !email} className="w-full">
                    {busy ? 'Sending…' : 'Email me a code'}
                  </Button>
                ) : (
                  <form onSubmit={doReset} className="space-y-4">
                    <Field label="6-digit code">
                      <input required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="field font-mono tracking-[0.3em] text-center" placeholder="••••••" />
                    </Field>
                    <Field label="New password (min 8)">
                      <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="field" />
                    </Field>
                    <Button type="submit" variant="gold" disabled={busy} className="w-full">
                      {busy ? 'Saving…' : 'Set password'}
                    </Button>
                  </form>
                )}
                {resetMsg && <p className={`text-xs font-bold rounded-xl px-3 py-2.5 border ${resetMsg.type === 'ok' ? 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30' : 'text-rose-500 bg-rose-500/10 border-rose-500/30'}`}>{resetMsg.text}</p>}
              </div>
            )}
            <Button variant="secondary" onClick={() => navigateTo('home')} className="w-full">← Back to site</Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const can = (mod, act) => me.role === 'super' || !!(me.permissions && me.permissions[mod] && me.permissions[mod][act]);
  const tabs = [
    { id: 'registrations', label: 'Registrations', icon: 'fa-inbox', show: can('registrations', 'view') },
    { id: 'events', label: 'Events', icon: 'fa-calendar-days', show: can('events', 'view') },
    { id: 'team', label: 'Team', icon: 'fa-users', show: can('team', 'view') },
  ];
  if (me.role === 'super') {
    tabs.push({ id: 'access', label: 'Access', icon: 'fa-key', show: true });
    tabs.push({ id: 'activity', label: 'Activity', icon: 'fa-clock-rotate-left', show: true });
  }
  const visibleTabs = tabs.filter((t) => t.show !== false);
  // Derived, not state: always a valid tab even before any click (no extra hook).
  const allowedIds = visibleTabs.map((t) => t.id);
  const activeTab = allowedIds.includes(tab) ? tab : (allowedIds[0] || 'registrations');

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="section-badge"><i className="fa-solid fa-lock text-gold-500" /> Admin panel</span>
          <h1 className="font-display text-3xl font-extrabold mt-3">Control Room</h1>
          <p className="font-mono text-xs opacity-60 mt-1">
            {me.email} · <span className="text-gold-600 dark:text-gold-300 font-bold">{me.role === 'super' ? 'SUPER ADMIN' : 'ADMIN'}</span>
            {me.role !== 'super' && (me.accessEnd || me.accessStart) && (
              <span> · access {me.accessStart ? fmtDate(me.accessStart) : '…'} → {me.accessEnd ? fmtDate(me.accessEnd) : '…'}</span>
            )}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-4 py-3 rounded-2xl font-mono text-xs font-bold border ${msg.type === 'ok' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'}`}>
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="!p-4 flex items-center gap-3">
              <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-sm ${s.tile}`}>
                <i className={`fa-solid ${s.icon}`} />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-xl font-extrabold leading-none truncate">{s.value}</span>
                <span className="block font-mono text-[10px] uppercase tracking-wider opacity-60 mt-1">{s.label}</span>
              </span>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-1 w-full">
          {visibleTabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-full font-display text-[13px] font-bold whitespace-nowrap border transition ${
                activeTab === t.id
                  ? 'bg-gradient-gold text-[#1A1405] border-transparent border-glow-gold'
                  : 'glass-panel opacity-70 hover:opacity-100'
              }`}>
              <i className={`fa-solid ${t.icon} mr-2 text-xs`} />{t.label}
            </button>
          ))}
          <button onClick={logout} className="px-4 py-2.5 rounded-full font-mono text-[11px] font-bold whitespace-nowrap border border-black/10 dark:border-white/15 opacity-70" title="Logout">
            <i className="fa-solid fa-right-from-bracket mr-1.5" />Logout
          </button>
        </div>

        <aside className="hidden lg:flex flex-col w-64 shrink-0 rounded-[22px] overflow-hidden spotlight text-white noise sticky top-24">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-gold-400 to-emerald-500 bg-[length:200%_100%] animate-gradient-x" />
          <div className="p-4 space-y-1.5">
            <div className="font-mono text-[10px] tracking-[0.25em] text-gold-300 px-3 pt-2 pb-1">CONTROL ROOM</div>
            {visibleTabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-display text-sm font-bold transition text-left ${
                  activeTab === t.id
                    ? 'bg-gradient-gold text-[#1A1405] border-glow-gold'
                    : 'text-cream-100/70 hover:text-white hover:bg-white/5'
                }`}>
                <i className={`fa-solid ${t.icon} text-xs w-4 text-center ${activeTab === t.id ? '' : 'text-gold-300/70'}`} />{t.label}
                {activeTab === t.id && <i className="fa-solid fa-chevron-right text-[10px] ml-auto" />}
              </button>
            ))}
            <div className="gold-rule opacity-60 !my-3" />
            <button onClick={() => navigateTo('home')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-display text-sm font-bold text-cream-50 border border-white/20 hover:border-emerald-400 hover:text-emerald-300 transition text-left">
              <i className="fa-solid fa-globe text-xs w-4 text-center" />Back to website
            </button>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 mt-1">
              <div className="font-mono text-[11px] text-cream-100/80 truncate" title={me.email}>{me.email}</div>
              <div className="font-mono text-[10px] font-bold text-gold-300 mt-0.5">{me.role === 'super' ? 'SUPER ADMIN' : 'ADMIN'}</div>
              <button onClick={logout} className="mt-2.5 font-mono text-[11px] font-bold text-cream-100/60 hover:text-rose-400 transition inline-flex items-center gap-1.5">
                <i className="fa-solid fa-right-from-bracket" /> Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {activeTab === 'registrations' && can('registrations', 'view') && <RegistrationsTab notify={notify} canManage={can('registrations', 'manage')} canRemove={can('registrations', 'remove')} />}
              {activeTab === 'events' && can('events', 'view') && <EventsTab notify={notify} canManage={can('events', 'manage')} canRemove={can('events', 'remove')} />}
              {activeTab === 'team' && can('team', 'view') && <TeamTab notify={notify} canManage={can('team', 'manage')} canRemove={can('team', 'remove')} />}
              {activeTab === 'access' && me.role === 'super' && <AccessTab notify={notify} />}
              {activeTab === 'activity' && me.role === 'super' && <ActivityTab notify={notify} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
