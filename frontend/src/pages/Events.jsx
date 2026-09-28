import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SectionHead } from '../components/SectionHead';
import { api } from '../lib/api';

// Badge theme per status: Present/Ongoing/Open = live emerald, Upcoming = gold, Completed = muted.
const statusStyle = (status = '') => {
  const s = status.toLowerCase();
  if (s.includes('present') || s.includes('ongoing') || s.includes('open')) return { text: 'text-emerald-600 dark:text-emerald-300', dot: 'bg-emerald-500 animate-pulse', box: 'bg-emerald-500/10 border-emerald-500/30' };
  if (s.includes('completed')) return { text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', box: 'bg-slate-500/10 border-slate-500/30' };
  return { text: 'text-gold-600 dark:text-gold-300', dot: 'bg-gold-500', box: 'bg-gold-500/10 border-gold-500/30' };
};

export const Events = ({ openRsvpModal, navigateTo }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const flagship = {
    title: 'Sun Launchpad 2026',
    tagline: 'IDEAS TODAY. IMPACT TOMORROW.',
    pitch: 'Have an idea? Or already building something? Sun Launchpad is for you.',
    status: 'Registration Open',
    dates: '5 & 9 October 2026',
    time: '10:00 AM',
    location: 'S Building Seminar Hall, Sandip University, Nashik',
    entry: 'Free for students',
    participation: 'Students · Solo or Team',
    rounds: [
      { num: 'Round 1', date: '5 October 2026', name: 'Idea to Pitch', focus: 'Present your raw concept or early prototype with clarity.' },
      { num: 'Round 2', date: '9 October 2026', name: 'From Idea to Business', focus: 'Structure your solution, market direction, and business model.' },
    ],
    whatYouGet: [
      { icon: 'fa-trophy', title: 'Trophies', desc: 'Awards for standout ideas and top pitch performers.' },
      { icon: 'fa-certificate', title: 'Certificate for Every Participant', desc: 'Official certificate recognizing all participating student founders.' },
      { icon: 'fa-microphone-lines', title: 'Pitch Experience', desc: 'Real stage pitch experience with constructive, real-world feedback.' },
      { icon: 'fa-seedling', title: 'Incubation Opportunity', desc: 'Pathway to explore structured incubation and venture building support.' },
    ],
  };

  const programs = [
    {
      id: 1,
      title: 'SUN LAUNCHPAD 2026',
      edition: 'Sun Entrepreneurship Club',
      category: 'Idea & Pitch Program',
      status: 'Registration Open',
      eventType: 'Two-Round Pitch Program',
      time: '5 & 9 Oct 2026 · 10:00 AM',
      venue: 'S Building Seminar Hall',
      desc: 'Have an idea or already building? Pitch in Round 1 (5 Oct) & Round 2 (9 Oct). Trophies, certificates & incubation opportunities.',
      image: '/sun-launchpad-poster.jpg',
      icon: 'fa-rocket',
      actionType: 'register',
    },
    {
      id: 2,
      title: 'Incubation Program',
      edition: 'Sun Entrepreneurship Club',
      category: 'Incubation',
      status: 'Upcoming',
      eventType: 'Cohort Support',
      time: 'To be announced',
      venue: 'Sandip University Campus',
      desc: 'Structured incubation support for validated student ideas and ventures.',
      icon: 'fa-seedling',
      actionType: 'rsvp',
    },
    {
      id: 3,
      title: 'Alumni Meetup',
      edition: 'Sun Entrepreneurship Club',
      category: 'Networking',
      status: 'Upcoming',
      eventType: 'Community Session',
      time: 'To be announced',
      venue: 'Sandip University Campus',
      desc: 'Interactive networking session connecting students with alumni and mentors.',
      icon: 'fa-users',
      actionType: 'rsvp',
    },
  ];

  const filters = [
    { label: 'All', value: 'ALL' },
    { label: 'Registration Open', value: 'Open' },
    { label: 'Upcoming', value: 'Upcoming' },
  ];

  const q = search.toLowerCase();
  const filtered = programs.filter(
    (e) =>
      (statusFilter === 'ALL' || e.status.toLowerCase().includes(statusFilter.toLowerCase())) &&
      (e.title.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-20 sm:-top-24 -left-4 sm:-left-8 -right-4 sm:-right-8 bottom-0 -z-10 overflow-hidden">
        <div className="floating-orb w-[480px] h-[480px] bg-emerald-500/12 -top-28 -right-28" />
        <div className="absolute inset-0 grid-pattern" />
      </div>

      <motion.section initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="pt-8 sm:pt-12 text-center space-y-5 max-w-3xl mx-auto">
        <span className="section-badge"><i className="fa-solid fa-calendar-star text-gold-500" /> Event pipeline</span>
        <h1 className="section-title font-display text-4xl sm:text-6xl font-extrabold text-balance">
          Where founders <span className="text-gradient-gold">get discovered.</span>
        </h1>
        <p className="section-subtitle text-sm sm:text-base">Live drives and upcoming pitch stages from the Sun Entrepreneurship Club.</p>
      </motion.section>

      {/* flagship */}
      <motion.section initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }} className="mt-12">
        <div className="relative overflow-hidden rounded-[28px] spotlight text-white noise">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-gold-400 to-emerald-500 bg-[length:200%_100%] animate-gradient-x" />
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#F6E3A6] drop-shadow-[0_0_10px_rgba(221,184,78,0.5)]">
                <span className="relative flex w-2.5 h-2.5"><span className="absolute w-full h-full rounded-full bg-emerald-400 animate-ping" /><span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400" /></span>
                Flagship · {flagship.status}
              </span>
              <span className="font-mono text-[10px] font-bold tracking-[0.25em] px-3 py-1.5 rounded-full border border-gold-500/35 bg-gold-500/[0.1] text-gold-300">
                {flagship.tagline}
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mt-5 text-cream-50">
              Sun Launchpad <span className="text-gold-300 drop-shadow-[0_0_18px_rgba(221,184,78,0.45)]">2026</span>
            </h2>
            <p className="font-display text-sm sm:text-base text-emerald-300 mt-2 font-semibold">
              &ldquo;{flagship.pitch}&rdquo;
            </p>

            {/* Event Key Information Blocks */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-7 font-mono text-xs">
              <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 flex items-start gap-3">
                <i className="fa-solid fa-clock text-gold-300 mt-0.5 text-sm" />
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-cream-100/45 uppercase font-bold">Event Time</div>
                  <div className="mt-1 text-cream-50 font-bold">{flagship.time}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 flex items-start gap-3">
                <i className="fa-solid fa-location-dot text-gold-300 mt-0.5 text-sm" />
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-cream-100/45 uppercase font-bold">Venue</div>
                  <div className="mt-1 text-cream-50 font-bold leading-snug">{flagship.location}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 flex items-start gap-3">
                <i className="fa-solid fa-users text-gold-300 mt-0.5 text-sm" />
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-cream-100/45 uppercase font-bold">Participation</div>
                  <div className="mt-1 text-cream-50 font-bold">{flagship.participation}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 flex items-start gap-3">
                <i className="fa-solid fa-ticket text-gold-300 mt-0.5 text-sm" />
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-cream-100/45 uppercase font-bold">Entry</div>
                  <div className="mt-1 text-cream-50 font-bold">{flagship.entry}</div>
                </div>
              </div>
            </div>

            {/* Event Rounds / The Journey */}
            <div className="mt-7 space-y-3">
              <div className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-gold-300">
                The Journey · Event Rounds
              </div>
              <div className="grid sm:grid-cols-2 gap-3.5">
                {flagship.rounds.map((r) => (
                  <div key={r.num} className="rounded-2xl border border-white/20 bg-white/[0.06] p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-gold-300 font-extrabold text-sm uppercase tracking-wider">{r.num}</span>
                      <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        {r.date}
                      </span>
                    </div>
                    <div className="font-display font-bold mt-2 text-base text-cream-50">{r.name}</div>
                    <p className="text-xs text-cream-100/70 mt-1 leading-relaxed">{r.focus}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What You Get */}
            <div className="mt-7 space-y-3">
              <div className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-gold-300">
                What You Get
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {flagship.whatYouGet.map((w) => (
                  <div key={w.title} className="rounded-2xl border border-white/15 bg-white/[0.05] p-4">
                    <i className={`fa-solid ${w.icon} text-gold-300 text-lg mb-2 block`} />
                    <div className="font-display font-bold text-sm text-cream-50">{w.title}</div>
                    <p className="text-xs text-cream-100/60 mt-1 leading-relaxed">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button variant="gold" onClick={() => navigateTo('register')}>
                Apply Now <i className="fa-solid fa-arrow-right text-xs" />
              </Button>
              <Button variant="secondary" onClick={() => openRsvpModal(flagship.title, flagship.dates, flagship.location)} className="!text-cream-50 !border-white/20 hover:!border-emerald-400">
                <i className="fa-solid fa-bell" /> Get Event Updates
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* filter + list */}
      <section className="mt-14 space-y-7">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between glass-panel rounded-2xl p-3 sm:p-4">
          <div className="relative w-full md:w-96">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xs opacity-40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search programs…"
              className="field !pl-10 !rounded-xl" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((f) => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border transition ${
                  statusFilter === f.value
                    ? 'bg-gradient-gold text-[#1A1405] border-transparent border-glow-gold'
                    : 'text-slate-500 dark:text-cream-100/75 opacity-80 hover:opacity-100 hover:text-emerald-950 dark:hover:text-white border-black/15 dark:border-white/15 lux-pill'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div layout className="grid md:grid-cols-3 gap-6">
              {filtered.map((e) => (
                <motion.div key={e.id} layout initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }}>
                  <Card hover hairline className="h-full flex flex-col !p-0 overflow-hidden group">
                    {/* Event Visual Thumbnail */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-b from-emerald-950/70 to-ink-950/90 border-b border-black/10 dark:border-white/10 flex items-center justify-center">
                      {/* Theme-based branded thumbnail background */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-emerald-900/30 to-ink-950/80">
                        <span className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center border-glow mb-2 group-hover:scale-105 transition-transform duration-300">
                          <i className={`fa-solid ${e.icon || 'fa-calendar-star'} text-lg text-gold-300`} />
                        </span>
                        <span className="font-display font-bold text-xs tracking-wider text-cream-100 uppercase">{e.title}</span>
                        <span className="text-[10px] font-mono text-emerald-300/70 uppercase tracking-widest mt-0.5">{e.category}</span>
                      </div>

                      {/* Official poster image if provided */}
                      {e.image && (
                        <img
                          src={e.image}
                          alt={e.title}
                          onLoad={(el) => { el.currentTarget.style.opacity = '1'; }}
                          onError={(el) => {
                            if (!el.currentTarget.dataset.triedPng) {
                              el.currentTarget.dataset.triedPng = 'true';
                              el.currentTarget.src = '/sun-launchpad-poster.png';
                            } else {
                              el.currentTarget.style.display = 'none';
                            }
                          }}
                          style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full bg-ink-950/85 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                          {e.category}
                        </span>
                        {(() => {
                          const s = statusStyle(e.status);
                          return (
                            <span className={`inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md bg-ink-950/85 ${s.text} ${s.box}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{e.status}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Event Card Content */}
                    <div className="p-5 sm:p-6 flex flex-col flex-grow">
                      <div className="font-mono text-[10px] tracking-[0.2em] text-gold-500 dark:text-gold-400 uppercase font-semibold">
                        {e.eventType || e.category}
                      </div>

                      <h3 className="font-display text-xl font-extrabold text-emerald-950 dark:text-white mt-1 group-hover:text-gold-400 transition-colors">
                        {e.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-cream-100/70 mt-2 flex-grow line-clamp-2 leading-relaxed">
                        {e.desc}
                      </p>

                      <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-500 dark:text-cream-100/60">
                        <div className="flex items-center gap-1.5">
                          <i className="fa-solid fa-clock text-gold-500 text-[10px]" />
                          <span>{e.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <i className="fa-solid fa-location-dot text-gold-500 text-[10px]" />
                          <span>{e.venue}</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-1">
                        {e.actionType === 'register' ? (
                          <Button variant="gold" onClick={() => navigateTo('register')} className="w-full !py-2.5 !text-xs font-bold shine-wrap">
                            Register Your Idea <i className="fa-solid fa-arrow-right text-xs" />
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={() => openRsvpModal(e.title, e.time, e.venue, null)} className="w-full !py-2.5 !text-xs">
                            View Event <i className="fa-solid fa-arrow-right text-xs" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-14 glass-panel rounded-[22px]">
              <i className="fa-solid fa-calendar-xmark text-3xl opacity-30" />
              <h3 className="font-display font-bold mt-3 text-emerald-950 dark:text-white">No programs found</h3>
              <p className="text-sm opacity-60 font-mono mt-1">Try a different filter or search term.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="mt-14 mb-6">
        <div className="rounded-[24px] border border-gold-500/30 bg-gold-500/[0.07] p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="eyebrow">Never miss a pitch night</div>
            <h3 className="font-display text-xl sm:text-2xl font-bold mt-2 text-emerald-950 dark:text-white">Get WhatsApp + email alerts for every round.</h3>
          </div>
          <Button variant="gold" onClick={() => navigateTo('register')}>
            Join the list <i className="fa-solid fa-arrow-right text-xs" />
          </Button>
        </div>
      </section>
    </div>
  );
};
