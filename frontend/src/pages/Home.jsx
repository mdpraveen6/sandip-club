import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SectionHead } from '../components/SectionHead';

const rise = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const Home = ({ navigateTo }) => {
  const [activeTab, setActiveTab] = useState('round1');
  const [activeSprintDay, setActiveSprintDay] = useState(1);
  const [openMyth, setOpenMyth] = useState(0);

  const stats = [
    { val: '₹1.5Cr+', label: 'Seed grant pool' },
    { val: '50+', label: 'Ventures incubated' },
    { val: '75+', label: 'Mentors & judges' },
    { val: '100%', label: 'Equity you keep' },
  ];

  const marquee = [
    'SUN Launchpad 2026', 'Seed Grants', '1:1 VC Mentorship', 'Prototyping Labs',
    'Founder Pass', 'Pitch Nights', 'Zero Equity Taken', 'SCIIE Incubation',
  ];

  const pillars = [
    { n: '01', icon: 'fa-lightbulb', title: 'Innovate', desc: 'A guided sprint that turns everyday campus frustrations into sharp, testable problem statements.', tags: ['Idea sprint', 'Problem labs'] },
    { n: '02', icon: 'fa-gears', title: 'Incubate', desc: 'Non-dilutive grants, SCIIE prototyping labs and weekly mentor reviews that turn drafts into demos.', tags: ['Seed grants', 'Build support'] },
    { n: '03', icon: 'fa-rocket', title: 'Launch', desc: 'Pitch to real investors on a real stage. Graduate with a venture, a network and a founder identity.', tags: ['Demo day', 'Funding'] },
  ];

  const advantages = [
    { title: 'Recognised incubation channel', desc: 'Apply through an official university pipeline — with documentation, compliance and grant procedures handled for you.', icon: 'fa-building-columns' },
    { title: 'Build rooms, not just classrooms', desc: 'SCIIE labs for hardware, IoT and robotics, plus mentor-led build weekends to ship your first prototype.', icon: 'fa-microchip' },
    { title: 'A 250-acre test market', desc: 'Pilot with hostels, canteens and classrooms — thousands of real users before you ever spend on ads.', icon: 'fa-flask' },
  ];

  const myths = [
    { tag: 'No company needed', q: 'Do I need a registered startup to apply?', a: 'No. Round 1 is designed for raw ideas — a clear problem, a proposed solution and the courage to pitch for 60 seconds. Registration, compliance and grants come later, with our help.' },
    { tag: 'Solo friendly', q: 'What if I have no team or technical co-founder?', a: 'Pitch solo. If you want a crew, our matchmaking desk pairs you with builders across engineering, management, pharmacy and design.' },
    { tag: 'Idea-stage ready', q: 'Do I need a finished product or prototype?', a: 'No. Round 1 judges clarity of thought, not polish. Prototyping labs and mentor builds unlock in Round 2 for shortlisted teams.' },
  ];

  const sprint = [
    { day: 1, title: 'Find the problem', task: 'Write down 3 frustrations you faced this week — in hostels, classes or commute.' },
    { day: 2, title: 'Name your user', task: 'Pick one person who feels this pain daily. Give them a name, age and routine.' },
    { day: 3, title: 'Sketch the fix', task: 'Describe the simplest possible solution in two sentences. No tech jargon.' },
    { day: 4, title: 'Study workarounds', task: 'List how people solve this today — and why your way is 10x better.' },
    { day: 5, title: 'Follow the money', task: 'Who pays, who benefits, and how does this sustain itself? Answer in one line each.' },
    { day: 6, title: 'Talk to 5 humans', task: 'Ask five classmates about the problem. Note exact quotes — bring them to your pitch.' },
    { day: 7, title: 'Pitch in 60 seconds', task: 'Problem → user → solution → vision. Record yourself, trim to one minute, submit.' },
  ];

  const outcomes = [
    { icon: 'fa-id-card', title: 'Verified Founder Pass', desc: 'A credential that opens mentor rooms, labs and pitch stages.' },
    { icon: 'fa-file-powerpoint', title: 'Investor-ready narrative', desc: 'Leave with a tight 60-second pitch and a structured deck outline.' },
    { icon: 'fa-handshake', title: 'Mentors + lab access', desc: 'Weekly reviews with operators and hands-on prototype support.' },
    { icon: 'fa-sack-dollar', title: 'Grant eligibility', desc: 'Shortlisted teams unlock non-dilutive seed funding pathways.' },
  ];

  const day = sprint[activeSprintDay - 1];

  return (
    <div className="relative">
      {/* ambient */}
      <div className="pointer-events-none absolute -top-20 sm:-top-24 -left-4 sm:-left-8 -right-4 sm:-right-8 bottom-0 -z-10 overflow-hidden">
        <div className="floating-orb w-[520px] h-[520px] bg-emerald-500/15 -top-32 -left-32" />
        <div className="floating-orb w-[420px] h-[420px] bg-gold-500/15 top-[30%] -right-32" />
        <div className="floating-orb w-[380px] h-[380px] bg-emerald-600/10 bottom-[8%] left-[10%]" />
        <div className="absolute inset-0 grid-pattern" />
      </div>

      {/* ============ HERO ============ */}
      <motion.section initial="hidden" animate="show" className="pt-4 sm:pt-8 pb-4 grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        <div className="lg:col-span-7">
          <motion.div variants={rise} custom={0}>
            <span className="section-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Admissions open · SUN Launchpad 2026
            </span>
          </motion.div>

          <motion.h1
            variants={rise} custom={1}
            className="font-display font-extrabold tracking-tight text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.6rem] mt-6 text-balance section-title"
          >
            Build your startup <span className="text-gradient-gold">before</span> you graduate.
          </motion.h1>

          <motion.p variants={rise} custom={2} className="section-subtitle text-base sm:text-lg mt-5 max-w-xl">
            SEBC is Sandip University&apos;s founder track — a 7-day idea sprint, two pitch rounds and
            seed-grant pathways that take you from a rough thought to a fundable venture. No company
            required. No equity taken.
          </motion.p>

          <motion.div variants={rise} custom={3} className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button variant="gold" onClick={() => navigateTo('register')} className="shine-wrap">
              Submit your idea <i className="fa-solid fa-arrow-right text-xs" />
            </Button>
            <Button variant="secondary" onClick={() => navigateTo('events')}>
              <i className="fa-solid fa-calendar-days text-emerald-500" /> Explore events
            </Button>
          </motion.div>

          <motion.div variants={rise} custom={4} className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-8 border-t border-black/10 dark:border-white/10">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl sm:text-[1.7rem] font-extrabold text-gradient-gold">{s.val}</div>
                <div className="text-xs mt-1 opacity-60">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* hero visual — founder pass */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 relative"
        >
          <div className="relative mx-auto max-w-sm">
            <div className="absolute -inset-6 bg-gradient-to-br from-emerald-500/20 via-gold-500/15 to-transparent blur-2xl rounded-[32px]" />
            <div className="relative rounded-[26px] overflow-hidden spotlight text-white noise">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-gold-400 to-emerald-500 bg-[length:200%_100%] animate-gradient-x" />
              <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.28em] text-gold-300">SEBC · FOUNDER PASS</span>
                  <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">● VERIFIED</span>
                </div>
                <div className="mt-6">
                  <div className="font-mono text-[10px] tracking-[0.2em] text-cream-100/50">FOUNDER</div>
                  <div className="font-display text-2xl font-extrabold mt-1">Your Name Here</div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-cream-100/50 mt-4">VENTURE</div>
                  <div className="text-sm text-cream-100/90 mt-1">The idea you pitch this semester</div>
                </div>
                <div className="gold-rule my-5 opacity-70" />
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-gold-300 font-bold">SEBC-2026-XXXXX</span>
                  <span className="text-cream-100/50">ROUND 1 · NASHIK</span>
                </div>
              </div>
            </div>

            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="static mt-4 lg:mt-0 lg:absolute lg:-left-8 lg:-top-4 rounded-2xl px-4 py-3 flex items-center gap-3 bg-ink-950 border border-white/10 dark:border-emerald-500/40 shadow-card dark:shadow-glow relative">
              <span className="absolute -top-1 -right-1 flex w-3 h-3">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-3 h-3 rounded-full bg-emerald-500 border-2 border-ink-950" />
              </span>
              <span className="w-9 h-9 rounded-xl bg-gradient-brand text-white flex items-center justify-center border-glow"><i className="fa-solid fa-sack-dollar text-sm" /></span>
              <span><span className="block font-display font-bold text-sm text-white">Grant eligible</span><span className="block text-[11px] text-white/60">up to ₹1.5 Cr pool</span></span>
            </motion.div>

            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="static mt-3 lg:mt-0 lg:absolute lg:-right-6 lg:bottom-16 rounded-2xl px-4 py-3 flex items-center gap-3 bg-ink-950 border border-white/10 dark:border-gold-500/40 shadow-card dark:shadow-glow-gold relative">
              <span className="absolute -top-1 -right-1 flex w-3 h-3">
                <span className="absolute inline-flex w-full h-full rounded-full bg-gold-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-3 h-3 rounded-full bg-gold-400 border-2 border-ink-950" />
              </span>
              <span className="w-9 h-9 rounded-xl bg-gradient-gold text-[#1A1405] flex items-center justify-center border-glow-gold"><i className="fa-solid fa-user-tie text-sm" /></span>
              <span><span className="block font-display font-bold text-sm text-white">Mentor matched</span><span className="block text-[11px] text-white/60">1:1 reviews weekly</span></span>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* ============ MARQUEE ============ */}
      <div className="mt-10 -mx-4 sm:-mx-8 border-y border-gold-500/30 bg-gold-500/[0.05] dark:bg-gold-500/[0.08] py-3.5 overflow-hidden marquee-mask">
        <div className="flex w-max animate-marquee gap-0">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {marquee.map((m) => (
                <span key={`${copy}-${m}`} className="flex items-center font-mono text-[11px] font-bold tracking-[0.22em] uppercase opacity-70 whitespace-nowrap">
                  <span className="px-5">{m}</span>
                  <span className="text-gold-500">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ PILLARS ============ */}
      <section className="pt-20 sm:pt-24 space-y-10">
        <SectionHead index="01" eyebrow="How it works"
          title={<>From classroom to company in <span className="text-gradient-gold">three moves.</span></>}
          sub="A tight, guided program — not another seminar club. Every week moves your idea closer to revenue or funding." />
        <div className="grid md:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <motion.div key={p.n} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, delay: i * 0.12 }}>
              <Card hover hairline className="h-full">
                <div className="flex items-start justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center text-lg border-glow">
                    <i className={`fa-solid ${p.icon}`} />
                  </span>
                  <span className="font-display text-4xl font-extrabold opacity-15 text-emerald-950 dark:text-gold-300">{p.n}</span>
                </div>
                <h3 className="font-display text-xl font-bold mt-5 text-emerald-950 dark:text-white">{p.title}</h3>
                <p className="text-sm section-subtitle mt-2">{p.desc}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {p.tags.map((t) => (
                    <span key={t} className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">{t}</span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ CAMPUS ============ */}
      <section className="pt-20 sm:pt-24 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28 space-y-5">
            <SectionHead align="left" index="02" eyebrow="Why Sandip"
              title={<>An unfair advantage, <span className="text-gradient">built into campus.</span></>}
              sub="A 250-acre university in Nashik wired for builders — recognised incubation, real labs and a living test market outside your hostel door." />
            <Button variant="gold" onClick={() => navigateTo('register')}>
              Claim your spot <i className="fa-solid fa-arrow-right text-xs" />
            </Button>
          </div>
        </div>
        <div className="lg:col-span-7 divide-y divide-black/10 dark:divide-white/15 border-y border-black/10 dark:border-white/15">
          {advantages.map((a, i) => (
            <motion.div key={a.title} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, delay: i * 0.08 }}
              className="py-7 px-4 -mx-4 rounded-2xl flex gap-5 group transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04] dark:hover:shadow-glow">
              <span className="font-mono text-xs font-bold text-gold-600 dark:text-gold-400 pt-1.5">0{i + 1}</span>
              <div>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl border border-emerald-600/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:border-glow-gold transition">
                    <i className={`fa-solid ${a.icon}`} />
                  </span>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-emerald-950 dark:text-white">{a.title}</h3>
                </div>
                <p className="text-sm section-subtitle mt-3 max-w-xl">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ MYTHS ============ */}
      <section className="pt-20 sm:pt-24 space-y-10">
        <SectionHead index="03" eyebrow="First-timer friendly"
          title={<>Nervous? <span className="text-gradient-gold">Good. Start here.</span></>}
          sub="Three fears stop most students from applying. All three are wrong." />
        <div className="max-w-3xl mx-auto space-y-3">
          {myths.map((m, i) => {
            const open = openMyth === i;
            return (
              <motion.div key={m.q} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}>
                <Card className={`!p-0 overflow-hidden transition-colors ${open ? '!border-gold-500/50 dark:bg-gold-500/[0.06] dark:shadow-glow-gold' : ''}`}>
                  <button onClick={() => setOpenMyth(open ? -1 : i)} className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left">
                    <span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">{m.tag}</span>
                      <span className="block font-display font-bold text-base sm:text-lg mt-1.5 text-emerald-950 dark:text-white">{m.q}</span>
                    </span>
                    <span className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${open ? 'bg-gradient-gold text-[#1A1405] border-transparent rotate-45' : 'border-black/15 dark:border-white/20'}`}>
                      <i className="fa-solid fa-plus text-sm" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.32 }}>
                        <p className="px-5 sm:px-6 pb-6 text-sm section-subtitle">{m.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============ SPRINT ============ */}
      <section className="pt-20 sm:pt-24 space-y-8">
        <SectionHead index="04" eyebrow="The on-ramp"
          title={<>Your first 7 days <span className="text-gradient">as a founder.</span></>}
          sub="A guided challenge for each day. Finish all seven and your Round 1 pitch practically writes itself." />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-start lg:justify-center">
          {sprint.map((s) => (
            <button key={s.day} onClick={() => setActiveSprintDay(s.day)}
              className={`shrink-0 px-4 py-2.5 rounded-full font-mono text-xs font-bold transition border ${
                activeSprintDay === s.day
                  ? 'bg-ink-950 text-cream-50 border-ink-950 dark:bg-gold-400 dark:text-[#1A1405] dark:border-gold-400 shadow-card dark:shadow-glow-gold day-pill-active'
                  : 'glass-panel text-slate-500 dark:text-cream-100/75 opacity-80 hover:opacity-100 hover:text-emerald-950 dark:hover:text-white lux-pill'
              }`}>
              Day {s.day}
            </button>
          ))}
        </div>
        <Card hairline className="max-w-4xl mx-auto !p-7 sm:!p-9">
          <AnimatePresence mode="wait">
            <motion.div key={activeSprintDay} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.32 }}
              className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="font-display text-5xl font-extrabold text-gradient-gold">0{day.day}</span>
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">Today&apos;s mission</div>
                    <h3 className="font-display text-xl font-bold text-emerald-950 dark:text-white">{day.title}</h3>
                  </div>
                </div>
                <p className="section-subtitle text-sm sm:text-base">{day.task}</p>
                <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <motion.div className="h-full bg-gradient-gold rounded-full" animate={{ width: `${(day.day / 7) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>
              <Button variant="gold" onClick={() => navigateTo('register')} className="shrink-0">
                Start Day {day.day} <i className="fa-solid fa-arrow-right text-xs" />
              </Button>
            </motion.div>
          </AnimatePresence>
        </Card>
      </section>

      {/* ============ ROADMAP ============ */}
      <section className="pt-20 sm:pt-24 space-y-8">
        <SectionHead index="05" eyebrow="The program"
          title={<>Two rounds. <span className="text-gradient-gold">One founder.</span></>}
          sub="Round 1 rewards clarity and courage. Round 2 rewards economics and execution." />
        <div className="flex justify-center gap-2">
          {[{ id: 'round1', l: 'Round 1 · Idea' }, { id: 'round2', l: 'Round 2 · Business' }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-6 py-3 rounded-full font-display text-[13px] font-bold transition border ${
                activeTab === t.id
                  ? 'bg-gradient-brand text-white border-transparent border-glow'
                  : 'glass-panel text-slate-500 dark:text-cream-100/75 opacity-80 hover:opacity-100 hover:text-emerald-950 dark:hover:text-white lux-pill'
              }`}>
              {t.l}
            </button>
          ))}
        </div>
        <Card hairline className="max-w-5xl mx-auto !p-7 sm:!p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'round1' ? (
              <motion.div key="r1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.32 }}
                className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">60-second pitch · Everyone welcome</span>
                  <h3 className="font-display text-2xl font-bold text-emerald-950 dark:text-white">Answer four questions. That&apos;s the whole round.</h3>
                  <ul className="space-y-2.5 text-sm section-subtitle">
                    {['What problem are you solving?', 'Who feels it every day?', 'What is your proposed fix?', 'Why does it matter now?'].map((q) => (
                      <li key={q} className="flex gap-2.5"><i className="fa-solid fa-circle-check text-emerald-500 mt-0.5" /> {q}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl p-6 spotlight text-white relative overflow-hidden noise">
                  <div className="font-mono text-[10px] tracking-[0.25em] text-gold-300">PITCH SCRIPT</div>
                  <p className="font-display text-base sm:text-lg leading-relaxed mt-3 italic">&ldquo;Hi, I&apos;m [Name]. [Users] struggle with [Problem]. My fix is [Solution] — and my vision is [Goal].&rdquo;</p>
                  <Button variant="gold" onClick={() => navigateTo('register')} className="mt-5 !py-2.5 !px-5 !text-xs">Use this script</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="r2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.32 }}
                className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30">Investor panel · Shortlisted teams</span>
                  <h3 className="font-display text-2xl font-bold text-emerald-950 dark:text-white">Prove it&apos;s a business, not just an idea.</h3>
                  <ul className="space-y-2.5 text-sm section-subtitle">
                    {['Market size & who pays first', 'Revenue model & unit economics', 'Moat: why you win', 'Prototype + 6-month roadmap'].map((q) => (
                      <li key={q} className="flex gap-2.5"><i className="fa-solid fa-circle-check text-gold-500 mt-0.5" /> {q}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl p-6 bg-gradient-brand text-white border-glow relative overflow-hidden">
                  <div className="font-mono text-[10px] tracking-[0.25em] text-white/70">WHAT WINNERS UNLOCK</div>
                  <p className="font-display text-lg leading-snug mt-3">Prototyping credits, weekly VC mentorship and eligibility for non-dilutive seed grants.</p>
                  <div className="font-display text-3xl font-extrabold mt-3">₹1.5Cr+ <span className="text-sm font-sans font-medium opacity-80">grant pool</span></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* ============ OUTCOMES ============ */}
      <section className="pt-20 sm:pt-24 space-y-10">
        <SectionHead index="06" eyebrow="What you leave with"
          title={<>Not a certificate. <span className="text-gradient">A toolkit.</span></>} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {outcomes.map((o, i) => (
            <motion.div key={o.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Card hover className="h-full">
                <span className="w-11 h-11 rounded-2xl bg-gold-500/12 text-gold-600 dark:text-gold-300 border border-gold-500/30 flex items-center justify-center">
                  <i className={`fa-solid ${o.icon}`} />
                </span>
                <h3 className="font-display font-bold mt-4 text-emerald-950 dark:text-white">{o.title}</h3>
                <p className="text-sm section-subtitle mt-1.5">{o.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <motion.section initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-70px' }} transition={{ duration: 0.7 }} className="pt-20 sm:pt-24 pb-10">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-gold text-[#1A1405] p-8 sm:p-14 noise shadow-card">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/25 blur-3xl" />
          <div className="relative grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="font-mono text-[11px] font-bold tracking-[0.25em] uppercase opacity-70">2026 cohort · Limited pitch slots</div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mt-3 text-balance">Your idea is the only entry ticket you need.</h2>
              <p className="mt-3 text-sm sm:text-base opacity-75 max-w-xl">Register in five minutes. Get your verified Founder Pass instantly and walk into Round 1 ready.</p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3">
              <Button variant="dark" onClick={() => navigateTo('register')} className="w-full !py-4">Register now <i className="fa-solid fa-arrow-right text-xs" /></Button>
              <Button variant="cta" onClick={() => navigateTo('events')} className="w-full !py-4">See the events <i className="fa-solid fa-calendar-days text-xs" /></Button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
