import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Home = ({ navigateTo }) => {
  const [activeTab, setActiveTab] = useState('round1');
  const [activeSprintDay, setActiveSprintDay] = useState(1);
  const [activeFearIdx, setActiveFearIdx] = useState(0);

  // Myth Busters / Fear Removal Data
  const myths = [
    {
      id: "01",
      tag: "NO COMPANY REQUIRED",
      question: "Do I need a registered company or startup?",
      answer: "Not at all. SUN Launchpad is built specifically for early-stage and raw student concepts. All you need is a real problem, a proposed solution, and the willingness to pitch."
    },
    {
      id: "02",
      tag: "SOLO & TEAM FRIENDLY",
      question: "What if I don't have a team or technical co-founder?",
      answer: "You can pitch solo! If you want teammates, our Team Formation Desk will connect you with students across Computer Science, Business, Pharmacy, and Design."
    },
    {
      id: "03",
      tag: "IDEA-STAGE READY",
      question: "Do I need a finished product or prototype?",
      answer: "No. Round 1 evaluates problem clarity, solution logic, and pitching confidence. Full prototyping equipment is unlocked at the SCIIE labs in Round 2."
    }
  ];

  // 7-Day Idea Building Campaign
  const sprintDays = [
    { day: 1, title: "Find the Problem", challenge: "Identify 3 real-world frustrations or inefficiencies you personally experienced this week." },
    { day: 2, title: "Define Your Customer", challenge: "Who exactly faces this problem every single day? Pinpoint their primary pain point." },
    { day: 3, title: "Shape the Solution", challenge: "What is the simplest, most effective mechanism to solve this problem?" },
    { day: 4, title: "Know Alternatives", challenge: "What current workarounds exist, and why is your approach significantly better?" },
    { day: 5, title: "Think Business", challenge: "Who would pay for or benefit from this solution? How does it sustain itself?" },
    { day: 6, title: "Validate Idea", challenge: "Talk to 5 potential users or classmates and gather raw feedback on your concept." },
    { day: 7, title: "Prepare the Pitch", challenge: "Structure your 60-second pitch: Problem, Solution, Target User, and Vision." }
  ];

  return (
    <div className="space-y-28 pb-16">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-6 text-center space-y-8 max-w-5xl mx-auto">
        
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold tracking-wide shadow-lg shadow-blue-500/10">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>SUN LAUNCHPAD 2026 • OFFICIAL ACCELERATION DRIVE</span>
        </div>

        {/* Headline */}
        <h1 className="font-sans font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.1] text-slate-900 dark:text-white">
          Turn Raw Ideas Into <br className="hidden sm:inline"/>
          <span className="text-gradient">Market-Leading Ventures.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
          You don't need a finished business—you need an idea worth presenting. We guide Sandip University students from initial concept to pitch confidence and seed grant access.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button onClick={() => navigateTo('register')} className="w-full sm:w-auto py-4 px-9 text-xs">
            <i className="fa-solid fa-rocket mr-2"></i> Submit Your Idea & Pitch
          </Button>
          <Button variant="secondary" onClick={() => navigateTo('events')} className="w-full sm:w-auto py-4 px-9 text-xs">
            <i className="fa-solid fa-calendar-days text-blue-500 mr-2"></i> Explore Events
          </Button>
        </div>

        {/* Metrics Ticker Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-10">
          {[
            { label: 'Grant & Seed Capital', val: '₹1.5Cr+', icon: 'fa-sack-dollar' },
            { label: 'Incubated Ventures', val: '50+', icon: 'fa-chart-line' },
            { label: 'Industry Mentors', val: '75+', icon: 'fa-user-tie' },
            { label: 'Equity Retained', val: '100%', icon: 'fa-shield-halved' }
          ].map((item, i) => (
            <Card key={i} className="text-center group hover:border-blue-500/40 transition duration-300">
              <i className={`fa-solid ${item.icon} text-blue-500 text-lg mb-2 group-hover:scale-110 transition-transform`}></i>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-gradient mb-1">{item.val}</div>
              <div className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{item.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ================= MOTTO & CORE PURPOSE ================= */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-blue-500/20 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <span className="text-blue-500 font-mono text-xs uppercase font-bold tracking-widest block">The SEBC Philosophy</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Built for Builders, Not Just Job Seekers.</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Most university clubs prepare students for interviews. SEBC creates job creators by providing a risk-free campus incubator to test ideas before graduation.
            </p>

            <div className="p-4 rounded-2xl bg-gradient-blue text-white font-mono font-bold text-center text-lg tracking-wider shadow-lg border-glow">
              INNOVATE • INCUBATE • IMPACT
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-blue-500/10 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold text-sm">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Innovate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Unlock problem-solving mindsets across Engineering, MBA, Pharmacy, and Design.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-blue-500/10 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold text-sm">
                <i className="fa-solid fa-gears"></i>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Incubate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Provide non-dilutive grants, prototyping labs, and 1-on-1 VC mentorship.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-blue-500/10 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold text-sm">
                <i className="fa-solid fa-arrow-trend-up"></i>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Impact</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Launch sustainable student ventures into real commercial markets.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= WHY SANDIP UNIVERSITY ================= */}
      <section className="space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-blue-500 font-mono text-xs uppercase font-bold tracking-widest">Unrivaled Infrastructure</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">The Sandip Campus Advantage</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Spanning over a premier 250+ acre ultramodern campus in Nashik, Sandip University provides student founders with government-recognized incubation channels and hardware resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-4 hover:border-blue-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl font-bold border border-blue-500/30">
              <i className="fa-solid fa-building-columns"></i>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">SANDIP Incubator Association</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Recognized under the Government of India's <strong>Startup India Seed Fund Scheme</strong>, facilitating direct capital disbursal to verified student innovations right on campus.
            </p>
          </Card>

          <Card className="space-y-4 hover:border-blue-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl font-bold border border-blue-500/30">
              <i className="fa-solid fa-microchip"></i>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">SCIIE Prototyping Labs</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Access high-performance GPU compute clusters, 3D printing equipment, IoT hardware test benches, and bio-testing labs directly within the campus.
            </p>
          </Card>

          <Card className="space-y-4 hover:border-blue-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl font-bold border border-blue-500/30">
              <i className="fa-solid fa-flask text-blue-500"></i>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Campus Testing Sandbox</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Deploy your early MVPs to thousands of students on campus to gather real customer data, refine product mechanics, and validate product-market fit.
            </p>
          </Card>
        </div>
      </section>

      {/* ================= MYTH BUSTERS (REMOVE THE FEAR) ================= */}
      <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-blue-500/20 shadow-xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-blue-500 font-mono text-xs uppercase font-bold tracking-widest">Confidence Building</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Hesitating to Apply? Let’s Clear the Myths</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {myths.map((item, idx) => (
            <div 
              key={item.id}
              onClick={() => setActiveFearIdx(idx)}
              className={`p-6 rounded-2xl cursor-pointer border transition flex flex-col justify-between ${
                activeFearIdx === idx 
                  ? 'bg-blue-50 dark:bg-navy-900 border-blue-500 shadow-md scale-[1.02]' 
                  : 'bg-white/40 dark:bg-navy-950/40 border-slate-200 dark:border-blue-500/10 hover:border-blue-400'
              }`}
            >
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 font-mono text-[10px] font-bold uppercase border border-blue-500/20 inline-block">
                  {item.tag}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{item.question}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 7-DAY IDEA BUILDING SPRINT ================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-blue-500 font-mono text-xs uppercase font-bold tracking-widest">Guided Student Sprint</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">7-Day Idea Building Pathway</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Follow these simple steps to refine your concept for SUN Launchpad Round 1.</p>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 justify-start lg:justify-center">
          {sprintDays.map((step) => (
            <button
              key={step.day}
              onClick={() => setActiveSprintDay(step.day)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition whitespace-nowrap ${
                activeSprintDay === step.day
                  ? 'bg-gradient-blue text-white shadow-md border-glow'
                  : 'glass-panel text-slate-400 border border-slate-200 dark:border-blue-500/15 hover:border-blue-400'
              }`}
            >
              DAY 0{step.day}
            </button>
          ))}
        </div>

        {/* Challenge Box */}
        <Card className="p-8 border-blue-500/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 font-mono text-xs font-bold uppercase border border-blue-500/20">
                Day 0{activeSprintDay} Theme: {sprintDays[activeSprintDay - 1].title}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Today's Action Challenge</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {sprintDays[activeSprintDay - 1].challenge}
              </p>
            </div>
            <Button onClick={() => navigateTo('register')} className="shrink-0 py-3.5 px-6">
              Apply With This Step <i className="fa-solid fa-arrow-right ml-1"></i>
            </Button>
          </div>
        </Card>
      </section>

      {/* ================= PROGRAM STRUCTURE (ROUND 1 vs ROUND 2) ================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-blue-500 font-mono text-xs uppercase font-bold tracking-widest">Program Execution</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">SUN Launchpad Pitch Roadmap</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Two structured phases designed to build student confidence and fund viable ventures.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setActiveTab('round1')}
            className={`px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase transition ${
              activeTab === 'round1' ? 'bg-gradient-blue text-white shadow-md' : 'glass-panel text-slate-400'
            }`}
          >
            Round 1: Confidence & Idea
          </button>
          <button
            onClick={() => setActiveTab('round2')}
            className={`px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase transition ${
              activeTab === 'round2' ? 'bg-gradient-blue text-white shadow-md' : 'glass-panel text-slate-400'
            }`}
          >
            Round 2: Business & Scaling
          </button>
        </div>

        {/* Tab Content */}
        <Card className="p-8 border-blue-500/30">
          {activeTab === 'round1' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 font-mono text-xs font-bold uppercase border border-blue-500/20">
                  Participation & Confidence Stage
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Round 1: Idea Pitching</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Round 1 is structured to build communication confidence. Founders present a short pitch answering four core questions:
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> What problem are you solving?</li>
                  <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Who experiences this problem?</li>
                  <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> What solution are you proposing?</li>
                  <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Why does this problem matter?</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-blue-500/10 space-y-3 font-mono text-xs">
                <span className="text-[10px] uppercase text-blue-500 font-bold block">Pitch Template</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "Hi, I'm [Name]. The problem I noticed is [Problem]. This affects [Target Audience]. My proposed solution is [Solution]. My vision is to [Goal]."
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 font-mono text-xs font-bold uppercase border border-blue-500/20">
                  Commercialization Stage
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Round 2: From Idea to Business</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Shortlisted participants move into a detailed business pitch before VCs and angel investors, covering:
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Target customer sizing & market potential</li>
                  <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Revenue model & unit economics</li>
                  <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Competitive differentiation & IP</li>
                  <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Prototype testing & future roadmap</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-blue-500/10 text-center space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Round 2 Outcome</span>
                <div className="font-mono text-2xl font-bold text-gradient">₹50,000 – ₹5,00,000</div>
                <p className="text-xs text-slate-500">Non-dilutive seed grants + SCIIE incubator desk space.</p>
              </div>
            </div>
          )}
        </Card>
      </section>

    </div>
  );
};