import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { Modal } from './components/Modal';

import { Home } from './pages/Home';
import { Events } from './pages/Events';
import { Register } from './pages/Register';
import { Team } from './pages/Team';
import { Admin } from './pages/Admin';
import { api, getToken, clearToken } from './lib/api';

import logoImg from './images/sandiplogo.jpg';

const NAV = [
  { id: 'home', label: 'Home', icon: 'fa-house' },
  { id: 'events', label: 'Events', icon: 'fa-calendar-days' },
  { id: 'register', label: 'Register', icon: 'fa-id-card' },
  { id: 'team', label: 'Team', icon: 'fa-users' },
];

export default function App() {
  const PAGE_IDS = ['home', 'events', 'register', 'team', 'admin'];
  const pageFromHash = () => {
    const h = (window.location.hash || '').replace('#/', '').split('?')[0];
    return PAGE_IDS.includes(h) ? h : 'home';
  };
  const [activePage, setActivePage] = useState(pageFromHash);
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalData, setModalData] = useState({ isOpen: false, title: '', content: null });
  // "Admin Panel" nav entry appears only while a valid admin session exists.
  const [showAdminLink, setShowAdminLink] = useState(false);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      if (!getToken()) { if (alive) setShowAdminLink(false); return; }
      try { await api.me(); if (alive) setShowAdminLink(true); }
      catch { clearToken(); if (alive) setShowAdminLink(false); }
    };
    check();
    window.addEventListener('sebc-admin-change', check);
    window.addEventListener('storage', check);
    return () => {
      alive = false;
      window.removeEventListener('sebc-admin-change', check);
      window.removeEventListener('storage', check);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Hash routing: every page (including admin) has a real link, e.g. /#/admin.
  // Back/forward buttons work via the hashchange listener below.
  useEffect(() => {
    const sync = () => {
      const h = (window.location.hash || '').replace('#/', '').split('?')[0];
      setActivePage(PAGE_IDS.includes(h) ? h : 'home');
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    setMobileMenuOpen(false);
    if ((window.location.hash || '') === `#/${page}`) {
      setActivePage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = `#/${page}`;
    }
  };

  const closeModal = () => setModalData((m) => ({ ...m, isOpen: false }));

  // eventId = Mongo _id when the card came from the live API (seat caps enforced).
  // null = built-in fallback event (offline-friendly instant confirm).
  const openRsvpModal = (title, time, venue, eventId = null) => {
    const showDone = (heading, sub) => {
      setModalData({ isOpen: true, title: 'RSVP Confirmed', content: (
        <div className="text-center space-y-3 py-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-brand text-white flex items-center justify-center text-xl border-glow">
            <i className="fa-solid fa-check" />
          </div>
          <p className="font-display font-bold">{heading}</p>
          <p className="text-sm opacity-70">{sub}</p>
          <Button onClick={closeModal} className="w-full">Done</Button>
        </div>
      ) });
    };
    const submitRsvp = async (name, email) => {
      if (!eventId) {
        showDone("You're on the list.", 'Watch your inbox for venue and reporting details.');
        return;
      }
      try {
        const d = await api.rsvp(eventId, { name, email });
        showDone(
          "You're on the list.",
          d.seatsLeft === null || d.seatsLeft === undefined
            ? 'Watch your inbox for venue and reporting details.'
            : d.seatsLeft === 0
              ? 'That was the last seat — see you there!'
              : `${d.seatsLeft} seat${d.seatsLeft === 1 ? '' : 's'} still open — see you there!`
        );
      } catch (err) {
        setModalData({ isOpen: true, title: 'RSVP Note', content: (
          <div className="text-center space-y-3 py-2">
            <p className="font-display font-bold">Heads up</p>
            <p className="text-sm opacity-70">{err.message}</p>
            <Button onClick={closeModal} className="w-full">OK</Button>
          </div>
        ) });
      }
    };
    setModalData({
      isOpen: true,
      title: 'Confirm Event RSVP',
      content: (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-900/15 dark:border-emerald-500/20 bg-emerald-950/[0.04] dark:bg-emerald-500/[0.06] p-4">
            <h4 className="font-display font-bold text-base">{title}</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-mono mt-1">{time}</p>
            <p className="text-xs opacity-60 mt-0.5">{venue}</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              submitRsvp(String(fd.get('name') || '').trim(), String(fd.get('email') || '').trim());
            }}
            className="space-y-3"
          >
            <input name="name" type="text" required placeholder="Your Full Name" className="field" />
            <input name="email" type="email" required placeholder="Sandip Email Address" className="field" />
            <Button type="submit" className="w-full">Confirm Spot</Button>
          </form>
        </div>
      ),
    });
  };

  // Shown after Register submit: application is pending admin review.
  // The Founder Pass itself is issued later, by email, on approval.
  const openReceiptModal = ({ name, title }) => {
    const first = String(name || '').trim().split(' ')[0];
    setModalData({
      isOpen: true,
      title: 'Application received',
      content: (
        <div className="text-center space-y-3 py-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-gold text-[#1A1405] flex items-center justify-center text-xl border-glow-gold">
            <i className="fa-solid fa-inbox" />
          </div>
          <p className="font-display font-bold">Thanks{first ? `, ${first}` : ''} — we got it.</p>
          <p className="text-sm opacity-70">
            “{title}” is now pending admin review. Your verified Founder Pass
            arrives by email once approved.
          </p>
          <Button onClick={closeModal} className="w-full">Done</Button>
        </div>
      ),
    });
  };

  // Admin gets a chromeless shell: no site header/footer, only the panel.
  if (activePage === 'admin') {
    return (
      <div className="bg-cream-50 dark:bg-ink-950 aurora-bg text-emerald-950 dark:text-white min-h-screen font-sans transition-colors duration-300">
        <main className="pt-4 sm:pt-6 pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full overflow-x-clip">
          <Admin navigateTo={handlePageChange} />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 dark:bg-ink-950 aurora-bg text-emerald-950 dark:text-white min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
          <button onClick={() => handlePageChange('home')} className="flex items-center gap-3 group">
            <span className="relative">
              <img src={logoImg} alt="SEBC logo" className="w-10 h-10 rounded-xl object-cover ring-1 ring-gold-500/40" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-cream-50 dark:border-ink-950" />
            </span>
            <span className="text-left leading-none">
              <span className="block font-display font-extrabold text-base sm:text-lg tracking-tight">
                SEBC <span className="brand-gold">× SUN</span>
              </span>
              <span className="block font-mono text-[9px] tracking-[0.24em] uppercase opacity-60 mt-1">
                Sandip E-Club · Nashik
              </span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1 p-1.5 rounded-full border border-black/[0.07] dark:border-gold-500/30 bg-black/[0.03] dark:bg-gold-500/[0.06] dark:shadow-glow-gold">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => handlePageChange(n.id)}
                className={`px-5 py-2 rounded-full font-display text-[13px] font-bold transition-all duration-300 ${
                  activePage === n.id
                    ? 'bg-gradient-gold text-[#1A1405] shadow-card'
                    : 'text-slate-600 dark:text-white opacity-90 hover:opacity-100 hover:bg-black/[0.05] dark:hover:bg-gold-500/15 dark:hover:text-[#F3E2A9]'
                }`}
              >
                {n.label}
              </button>
            ))}
            {showAdminLink && (
              <button
                onClick={() => handlePageChange('admin')}
                className="px-5 py-2 rounded-full font-display text-[13px] font-bold transition-all duration-300 whitespace-nowrap border border-gold-500/50 text-gold-700 dark:text-gold-300 bg-gold-500/10 hover:bg-gold-500/20"
              >
                <i className="fa-solid fa-lock text-[10px] mr-1.5" />Admin Panel
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-full border border-black/10 dark:border-gold-500/40 flex items-center justify-center hover:border-gold-500/60 transition bg-black/[0.03] dark:bg-gold-500/15 text-slate-700 dark:text-cream-100 dark:shadow-glow-gold"
            >
              <i className={`fa-solid text-base ${isDark ? 'fa-sun text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]' : 'fa-moon text-emerald-700'}`} />
            </button>
            <Button variant="gold" onClick={() => handlePageChange('register')} className="hidden sm:inline-flex !px-6 !py-2.5">
              Apply Now <i className="fa-solid fa-arrow-right text-xs" />
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="lg:hidden w-10 h-10 rounded-full border border-black/10 dark:border-white/15 flex items-center justify-center text-slate-700 dark:text-cream-100"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mx-4 mb-4 rounded-2xl glass-panel border p-2 shadow-premium-dark animate-scale-in">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => handlePageChange(n.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-display text-sm font-bold transition ${
                  activePage === n.id
                    ? 'bg-gradient-gold text-[#1A1405]'
                    : 'text-slate-600 dark:text-white opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-gold-500/15 dark:hover:text-[#F3E2A9]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <i className={`fa-solid ${n.icon} text-xs opacity-70`} /> {n.label}
                </span>
                {activePage === n.id && <i className="fa-solid fa-chevron-right text-xs" />}
              </button>
            ))}
            {showAdminLink && (
              <button
                onClick={() => handlePageChange('admin')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-display text-sm font-bold border border-gold-500/50 text-gold-700 dark:text-gold-300 bg-gold-500/10 transition"
              >
                <span className="flex items-center gap-3">
                  <i className="fa-solid fa-lock text-xs" /> Admin Panel
                </span>
                <i className="fa-solid fa-chevron-right text-[10px]" />
              </button>
            )}
            <div className="p-2">
              <Button variant="gold" onClick={() => handlePageChange('register')} className="w-full">
                Apply Now <i className="fa-solid fa-arrow-right text-xs" />
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-grow pt-20 sm:pt-24 pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full overflow-x-clip">
        {activePage === 'home' && <Home navigateTo={handlePageChange} />}
        {activePage === 'events' && <Events openRsvpModal={openRsvpModal} navigateTo={handlePageChange} />}
        {activePage === 'register' && <Register onApplicationReceived={openReceiptModal} />}
        {activePage === 'team' && <Team navigateTo={handlePageChange} />}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mt-12 relative overflow-hidden bg-ink-950 text-cream-50 border-t border-gold-500/25">
        <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[720px] h-[260px] rounded-full bg-emerald-500/15 blur-[110px]" />
        <div className="h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="SEBC logo" className="w-11 h-11 rounded-xl object-cover ring-1 ring-gold-500/50 shadow-glow-gold" />
              <span>
                <span className="block font-display font-extrabold text-xl tracking-tight">SEBC <span className="text-gold-300 drop-shadow-[0_0_10px_rgba(221,184,78,0.45)]">× SUN</span></span>
                <span className="block font-mono text-[9px] tracking-[0.24em] uppercase text-cream-100/70 mt-1">Sandip E-Club · Nashik</span>
              </span>
            </div>
            <p className="text-sm text-cream-100/80 leading-relaxed max-w-sm">
              Sandip Entrepreneurship &amp; Business Club — turning raw student ideas into fundable ventures, on campus in Nashik.
            </p>
            <div className="flex gap-2">
              {['fa-x-twitter', 'fa-instagram', 'fa-linkedin-in', 'fa-youtube'].map((s) => (
                <span key={s} className="w-9 h-9 rounded-full border border-white/20 text-cream-100/85 flex items-center justify-center text-sm hover:text-gold-300 hover:border-gold-500/60 hover:shadow-glow-gold transition cursor-pointer">
                  <i className={`fa-brands ${s}`} />
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-gold-300">Explore</h4>
            {NAV.map((n) => (
              <button key={n.id} onClick={() => handlePageChange(n.id)} className="block text-sm text-cream-100/80 hover:text-gold-300 transition">
                {n.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-gold-300">Program</h4>
            {['Round 1 — Idea Pitch', 'Round 2 — Business Pitch', '7-Day Idea Sprint', 'Founder Pass'].map((t) => (
              <button key={t} onClick={() => handlePageChange('home')} className="block text-sm text-cream-100/80 hover:text-gold-300 transition text-left">
                {t}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-gold-300">Find Us</h4>
            <p className="text-sm text-cream-100/80 leading-relaxed">
              SCIIE Hub, Block-B<br />Sandip University,<br />Nashik, Maharashtra
            </p>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-display font-bold text-sm">2026 cohort open</div>
                <div className="text-xs text-cream-100/70">Limited pitch slots.</div>
              </div>
              <Button variant="gold" onClick={() => handlePageChange('register')} className="!px-5 !py-2.5 !text-[11px]">Apply</Button>
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-cream-100/60">
            <span>© 2026 SEBC · Sandip University. All rights reserved.</span>
            <button onClick={() => handlePageChange('admin')} className="hover:text-gold-300 transition inline-flex items-center gap-1.5">
              <i className="fa-solid fa-lock text-[10px]" /> Admin
            </button>
            <span>Built by the SEBC Technical Team</span>
          </div>
        </div>
      </footer>

      <Modal isOpen={modalData.isOpen} onClose={closeModal} title={modalData.title}>
        {modalData.content}
      </Modal>
    </div>
  );
}
