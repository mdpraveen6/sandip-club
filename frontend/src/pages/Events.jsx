import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Events = ({ openRsvpModal, navigateTo }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Flagship Event Overview: SUN LAUNCHPAD 2026
  const flagshipEvent = {
    title: "SUN LAUNCHPAD 2026",
    subtitle: "Sandip University's Official Student Acceleration Drive",
    status: "UPCOMING • DATES TO BE ANNOUNCED",
    location: "Sandip University Campus / SCIIE Hub, Nashik",
    grantPool: "Up to ₹1.5 Cr Seed Grants",
    overview: "SUN Launchpad is a platform to bring your idea forward, present it, receive feedback, and explore how it can become a real commercial business. You don't need a registered company—you just need an idea worth presenting.",
    rounds: [
      {
        num: "01",
        name: "Round 1: Idea & Confidence Pitch",
        focus: "Participation & pitch structure. Present the problem, proposed solution, target audience, and vision in 60 seconds."
      },
      {
        num: "02",
        name: "Round 2: Business & Commercialization",
        focus: "Detailed business pitch before VCs and angel syndicates covering market size, unit economics, differentiation, and roadmap."
      }
    ]
  };

  // Structured Event Database
  const eventsList = [
    {
      id: 1,
      title: "SUN LAUNCHPAD 2026 - Official Registration Drive",
      category: "Registration & Matchmaking",
      status: "Present",
      time: "ACTIVE NOW • ONGOING",
      venue: "SCIIE Hub, Block-B / Online",
      desc: "Live registration drive for student founders. Submit your raw pitch idea, get direct guidance on pitch structure, or find co-founders across departments."
    },
    {
      id: 2,
      title: "SUN LAUNCHPAD 2026 - Main Pitch Competition",
      category: "Pitch Competition",
      status: "Upcoming",
      time: "DATES TO BE ANNOUNCED",
      venue: "Main Auditorium, Sandip University",
      desc: "The flagship student acceleration event featuring Round 1 confidence pitches and Round 2 VC business evaluations for non-dilutive seed grants."
    }
  ];

  // Filtering Logic
  const filteredEvents = eventsList.filter((evt) => {
    const matchesStatus = statusFilter === 'ALL' || evt.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = evt.title.toLowerCase().includes(search.toLowerCase()) ||
                          evt.desc.toLowerCase().includes(search.toLowerCase()) ||
                          evt.category.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-20 pb-16">
      
      {/* ================= PAGE HEADER ================= */}
      <section className="text-center pt-4 space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
          <i className="fa-solid fa-calendar-star text-blue-500"></i> Sandip Event Pipeline
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Events & Pitch Hub
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Discover active drives and upcoming acceleration pitch stages organized by the Sandip Entrepreneurship & Business Club.
        </p>
      </section>

      {/* ================= FLAGSHIP EVENT HERO CARD ================= */}
      <section>
        <Card className="p-8 sm:p-12 border-2 border-blue-500/40 relative overflow-hidden bg-gradient-to-br from-blue-900/10 via-transparent to-transparent">
          
          {/* Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-500/20 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-500">
                {flagshipEvent.status}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-mono text-[11px] font-bold uppercase border border-blue-500/20">
                Flagship Drive
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-bold uppercase border border-slate-200 dark:border-blue-500/20">
                Sandip University
              </span>
            </div>
          </div>

          {/* Title & Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                {flagshipEvent.title}
              </h2>
              <p className="text-blue-500 font-mono text-xs font-bold uppercase tracking-wide">
                {flagshipEvent.subtitle}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {flagshipEvent.overview}
              </p>
            </div>

            {/* Event Highlights Panel */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-blue-500/20 space-y-4 font-mono text-xs">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <i className="fa-solid fa-location-dot text-blue-500 text-base"></i>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">VENUE</span>
                  <span>{flagshipEvent.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <i className="fa-solid fa-clock text-amber-500 text-base"></i>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">DATE & TIME</span>
                  <span className="text-amber-500 font-bold">To Be Announced Soon</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <i className="fa-solid fa-sack-dollar text-emerald-500 text-base"></i>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">GRANT CAPITAL</span>
                  <span className="text-emerald-500 font-bold">{flagshipEvent.grantPool}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pitch Rounds Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-blue-500/20 mb-8">
            {flagshipEvent.rounds.map((round) => (
              <div key={round.num} className="p-5 rounded-2xl bg-white/50 dark:bg-navy-950/50 border border-slate-200 dark:border-blue-500/10 space-y-2">
                <span className="text-xs font-mono font-bold text-blue-500">STAGE {round.num}</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{round.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{round.focus}</p>
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-blue text-white shadow-xl border-glow">
            <div>
              <h4 className="font-bold text-base">Get Notified When Dates Launch</h4>
              <p className="text-xs text-blue-100">Register your interest today to receive direct WhatsApp & Email updates for Round 1 reporting.</p>
            </div>
            <Button 
              variant="secondary"
              onClick={() => openRsvpModal(flagshipEvent.title, "Dates TBA", flagshipEvent.location)}
              className="w-full sm:w-auto py-3 px-6 whitespace-nowrap bg-white text-blue-600 hover:bg-slate-100 border-none"
            >
              <i className="fa-solid fa-bell mr-2"></i> Express Interest / Get Alert
            </Button>
          </div>

        </Card>
      </section>

      {/* ================= SEARCH & STATUS FILTER SECTION ================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-200 dark:border-blue-500/20">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder="Search events, topics..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-blue-500/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
            {[
              { label: 'All', value: 'ALL' },
              { label: 'Present', value: 'Present' },
              { label: 'Upcoming', value: 'Upcoming' },
              { label: 'Completed', value: 'Completed' }
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition whitespace-nowrap ${
                  statusFilter === btn.value
                    ? 'bg-gradient-blue text-white shadow-md'
                    : 'bg-white dark:bg-navy-900 text-slate-400 border border-slate-200 dark:border-blue-500/10 hover:border-blue-400'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

        </div>

        {/* Dynamic Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((evt) => (
              <Card key={evt.id} className="flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-mono font-bold uppercase border border-blue-500/20">
                      {evt.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                      evt.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-pulse' :
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {evt.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{evt.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{evt.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-blue-500/15 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">{evt.time}</span>
                  {evt.status === 'Present' ? (
                    <Button 
                      onClick={() => navigateTo('register')}
                      className="py-1.5 px-3 text-[11px]"
                    >
                      Register Now <i className="fa-solid fa-arrow-right ml-1"></i>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => openRsvpModal(evt.title, evt.time, evt.venue)}
                      className="py-1.5 px-3 text-[11px]"
                    >
                      Get Event Alert
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-2xl border border-slate-200 dark:border-blue-500/15 space-y-2">
            <i className="fa-solid fa-calendar-xmark text-slate-400 text-3xl mb-1"></i>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Events Found</h3>
            <p className="text-slate-400 text-xs font-mono max-w-sm mx-auto">
              {statusFilter === 'Completed' 
                ? 'There are currently no completed past events. Stay tuned as new event drives conclude!'
                : 'No events matched your search query.'}
            </p>
          </div>
        )}
      </section>

    </div>
  );
};