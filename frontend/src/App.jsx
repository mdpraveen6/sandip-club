import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { Modal } from './components/Modal';

// Pages
import { Home } from './pages/Home';
import { Events } from './pages/Events';
import { Register } from './pages/Register';
import { Team } from './pages/Team';

// Logo
import logoImg from './images/sandiplogo.jpg';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalData, setModalData] = useState({ isOpen: false, title: '', content: null });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handlePageChange = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false); // Close mobile drawer when user picks a page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRsvpModal = (title, time, venue) => {
    setModalData({
      isOpen: true,
      title: "Confirm Event RSVP",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-base">{title}</h4>
            <p className="text-xs text-blue-500 font-mono">{time}</p>
            <p className="text-xs text-slate-400">{venue}</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert("RSVP Confirmed!"); setModalData({ isOpen: false }); }} className="space-y-3">
            <input type="text" required placeholder="Your Full Name" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-blue-500/20 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
            <input type="email" required placeholder="Sandip Email Address" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-blue-500/20 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
            <Button type="submit" className="w-full py-2.5">Confirm Spot</Button>
          </form>
        </div>
      )
    });
  };

  const openPassModal = (passData) => {
    setModalData({
      isOpen: true,
      title: "Digital Founder Pass",
      content: (
        <div className="bg-navy-950 p-6 rounded-2xl border border-blue-500/30 space-y-4 font-mono text-xs text-white">
          <div className="flex justify-between items-center border-b border-blue-500/20 pb-2">
            <span className="font-bold text-blue-400">SEBC FOUNDER PASS</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">VERIFIED</span>
          </div>
          <div className="space-y-1">
            <p><span className="text-slate-400">FOUNDER:</span> {passData.name}</p>
            <p><span className="text-slate-400">VENTURE:</span> {passData.title}</p>
            <p><span className="text-slate-400">DEPT:</span> {passData.dept}</p>
            <p><span className="text-slate-400">REF ID:</span> <span className="text-blue-400">{passData.ref}</span></p>
          </div>
          <div className="pt-2 border-t border-blue-500/20 flex justify-between items-center text-[10px] text-slate-400">
            <span>{passData.timestamp}</span>
            <Button onClick={() => window.print()} className="py-1.5 px-3">Print Pass</Button>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans">
      
      {/* ================= FIXED HEADER ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-blue-500/20">
        
        {/* Logo */}
        <button onClick={() => handlePageChange('home')} className="flex items-center gap-3">
          <img src={logoImg} alt="Sandip E-Club Logo" className="w-9 h-9 object-contain" />
          <span className="font-mono font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
            SANDIP <span className="text-gradient">E-CLUB</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex gap-2">
          {['home', 'events', 'register', 'team'].map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition ${
                activePage === page ? 'bg-gradient-blue text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
              }`}
            >
              {page}
            </button>
          ))}
        </nav>

        {/* Right Controls (Theme Toggle & Mobile Menu Hamburger) */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsDark(!isDark)} className="py-2 px-3 text-xs">
            <i className={`fa-solid ${isDark ? 'fa-sun text-amber-500' : 'fa-moon text-indigo-400'}`}></i>
            <span className="hidden sm:inline ml-1">{isDark ? 'Light' : 'Dark'}</span>
          </Button>

          {/* Hamburger Menu Toggle (Mobile Screens Only) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-blue-500/20 text-lg focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 glass-panel border-b border-slate-200 dark:border-blue-500/20 p-4 shadow-2xl flex flex-col gap-2 bg-slate-50/95 dark:bg-navy-950/95 backdrop-blur-xl">
            {['home', 'events', 'register', 'team'].map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center justify-between ${
                  activePage === page
                    ? 'bg-gradient-blue text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900'
                }`}
              >
                <span>{page}</span>
                {activePage === page && <i className="fa-solid fa-chevron-right text-[10px]"></i>}
              </button>
            ))}
          </div>
        )}

      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-grow pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {activePage === 'home' && <Home navigateTo={handlePageChange} />}
        {activePage === 'events' && <Events openRsvpModal={openRsvpModal} navigateTo={handlePageChange} />}
        {activePage === 'register' && <Register onPassGenerated={openPassModal} />}
        {activePage === 'team' && <Team />}
      </main>

      {/* Modal Container */}
      <Modal isOpen={modalData.isOpen} onClose={() => setModalData({ ...modalData, isOpen: false })} title={modalData.title}>
        {modalData.content}
      </Modal>

    </div>
  );
}