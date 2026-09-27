import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SectionHead } from '../components/SectionHead';
import { api } from '../lib/api';

// Badge theme per status: Present/Ongoing = live emerald, Upcoming = gold, Completed = muted.
const statusStyle = (status = '') => {
  const s = status.toLowerCase();
  if (s.includes('present') || s.includes('ongoing')) return { text: 'text-emerald-600 dark:text-emerald-300', dot: 'bg-emerald-500 animate-pulse', box: 'bg-emerald-500/10 border-emerald-500/30' };
  if (s.includes('completed')) return { text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', box: 'bg-slate-500/10 border-slate-500/30' };
  return { text: 'text-gold-600 dark:text-gold-300', dot: 'bg-gold-500', box: 'bg-gold-500/10 border-gold-500/30' };
};

export const Events = ({ openRsvpModal, navigateTo }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const flagship = {
    title: 'Sun Launchpad 2026',
    subtitle: "Sandip University's official student acceleration drive",
    status: 'Ongoing / Present Event',
    dates: 'Dates to be announced',
    location: 'Sandip University Campus · SCIIE Hub, Nashik',
    grantPool: 'Up to ₹1.5 Cr seed grants',
    overview:
      'Sun Launchpad 2026 is Sandip University’s official student acceleration drive designed to turn early-stage student ideas into fundable startups through hands-on guidance. No registered company is required to join, and you retain 100% equity.',
    steps: [
      { num: '01', title: 'Submit Your Idea', desc: 'Fill out the 5-minute registration form with your problem statement and proposed solution.' },
      { num: '02', title: 'Mentorship & Sprints', desc: 'Work with mentors, refine your pitch deck format, and test your business assumptions.' },
      { num: '03', title: 'Pitch On Stage', desc: 'Present in the competition rounds for feedback, incubation access, and seed grant pathways.' },
    ],
    rounds: [
      { num: '01', name: 'Idea & confidence pitch', focus: 'A 60-second pitch: problem, user, solution, vision. Judged on clarity and courage.' },
      { num: '02', name: 'Business & commercialization', focus: 'Full business pitch before VCs: market, unit economics, moat and roadmap.' },
    ],
  };

  const programs = [
    {
      id: 1,
      title: 'Sun Launchpad 2026',
      edition: 'Sun Entrepreneurship Club',
      category: 'Acceleration Drive',
      status: 'Ongoing / Present Event',
      time: 'Dates to be announced',
      venue: 'Sandip University Campus',
      desc: "Sandip University's flagship student acceleration drive. Submit your idea, receive mentorship, and pitch on stage.",
    },
    {
      id: 2,
      title: 'Incubation Program',
      edition: 'Sun Entrepreneurship Club',
      category: 'Incubation',
      status: 'Upcoming',
      time: 'Dates to be announced',
      venue: 'Sandip University Campus',
      desc: 'Structured incubation support for validated student startups, offering dedicated workspace, mentorship, and seed resources.',
    },
    {
      id: 3,
      title: 'Alumni Meetup',
      edition: 'Sun Entrepreneurship Club',
      category: 'Networking & Community',
      status: 'Upcoming',
      time: 'Dates to be announced',
      venue: 'Sandip University Campus',
      desc: 'Interactive networking session connecting current student founders with university alumni entrepreneurs and industry mentors.',
    },
  ];

  const filters = [
    { label: 'All', value: 'ALL' },
    { label: 'Ongoing / Present', value: 'Ongoing' },
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
              <span className="font-mono text-[10px] font-bold tracking-[0.25em] px-3 py-1.5 rounded-full border border-gold-500/35 bg-gold-500/[0.1] text-gold-300">SUN × SCIIE</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mt-5 text-cream-50">Sun Launchpad <span className="text-gold-300 drop-shadow-[0_0_18px_rgba(221,184,78,0.45)]">2026</span></h2>
            <p className="font-mono text-xs text-emerald-300 mt-2 uppercase tracking-wider">{flagship.subtitle}</p>
            <p className="text-cream-100/80 text-sm sm:text-base leading-relaxed mt-4 max-w-3xl">{flagship.overview}</p>

            {/* What students need to do */}
            <div className="mt-8 space-y-3">
              <div className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-gold-300">What Students Need To Do</div>
              <div className="grid sm:grid-cols-3 gap-3">
                {flagship.steps.map((st) => (
                  <div key={st.num} className="rounded-2xl border border-white/20 bg-white/[0.05] p-4">
                    <div className="font-display text-gold-300 font-extrabold text-sm">{st.num}</div>
                    <div className="font-display font-bold mt-1 text-sm text-cream-50">{st.title}</div>
                    <p className="text-xs text-cream-100/60 mt-1 leading-relaxed">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-4 font-mono text-xs">
              {[
                { icon: 'fa-location-dot', k: 'Venue', v: flagship.location },
                { icon: 'fa-clock', k: 'When', v: flagship.dates },
                { icon: 'fa-sack-dollar', k: 'Grants', v: flagship.grantPool },
              ].map((m) => (
                <div key={m.k} className="rounded-2xl border border-white/20 bg-white/[0.06] p-4 flex gap-3">
                  <i className={`fa-solid ${m.icon} text-gold-300 mt-0.5`} />
                  <div><div className="text-[10px] tracking-[0.2em] text-cream-100/45">{m.k.toUpperCase()}</div><div className="mt-1 text-cream-50">{m.v}</div></div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {flagship.rounds.map((r) => (
                <div key={r.num} className="rounded-2xl border border-white/20 bg-white/[0.05] p-5">
                  <div className="font-display text-gold-300 font-extrabold text-sm">Stage {r.num}</div>
                  <div className="font-display font-bold mt-1">{r.name}</div>
                  <p className="text-sm text-cream-100/60 mt-1.5 leading-relaxed">{r.focus}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button variant="gold" onClick={() => navigateTo('register')}>
                Apply Now <i className="fa-solid fa-arrow-right text-xs" />
              </Button>
              <Button variant="secondary" onClick={() => openRsvpModal(flagship.title, flagship.dates, flagship.location)} className="!text-cream-50 !border-white/20 hover:!border-emerald-400">
                <i className="fa-solid fa-bell" /> Notify me at launch
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
            <motion.div layout className="grid md:grid-cols-3 gap-5">
              {filtered.map((e) => (
                <motion.div key={e.id} layout initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }}>
                  <Card hover hairline className="h-full flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">{e.category}</span>
                      {(() => {
                        const s = statusStyle(e.status);
                        return (
                          <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${s.text} ${s.box}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{e.status}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.22em] opacity-45 mt-4">{e.edition.toUpperCase()}</div>
                    <h3 className="font-display text-xl font-bold mt-1 text-emerald-950 dark:text-white">{e.title}</h3>
                    <p className="text-sm section-subtitle mt-2 flex-grow">{e.desc}</p>
                    <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-1.5 font-mono text-[11px] opacity-70">
                      <div><i className="fa-solid fa-clock mr-2 text-gold-500" />{e.time}</div>
                      <div><i className="fa-solid fa-location-dot mr-2 text-gold-500" />{e.venue}</div>
                    </div>
                    <div className="mt-5">
                      {e.status.includes('Present') || e.status.includes('Ongoing') ? (
                        <Button onClick={() => navigateTo('register')} className="w-full">Apply Now <i className="fa-solid fa-arrow-right text-xs" /></Button>
                      ) : (
                        <Button variant="outline" onClick={() => openRsvpModal(e.title, e.time, e.venue, null)} className="w-full">Get event alert</Button>
                      )}
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
