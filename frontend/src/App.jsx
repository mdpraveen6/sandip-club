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
  const [modalData, setModalData] = useState({ isOpen: false, title: '', content: null });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
            <input type="text" required placeholder="Your Full Name" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-blue-500/20 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500" />
            <input type="email" required placeholder="Sandip Email Address" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-blue-500/20 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500" />
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
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav px-6 py-4 flex items-center justify-between">
        <button onClick={() => setActivePage('home')} className="flex items-center gap-3">
          <img src={logoImg} alt="Sandip E-Club Logo" className="w-10 h-10 object-contain" />
          <span className="font-mono font-extrabold text-xl">SANDIP <span className="text-gradient">E-CLUB</span></span>
        </button>

        <nav className="hidden lg:flex gap-2">
          {['home', 'events', 'register', 'team'].map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition ${
                activePage === page ? 'bg-gradient-blue text-white' : 'text-slate-400'
              }`}
            >
              {page}
            </button>
          ))}
        </nav>

        <Button variant="outline" onClick={() => setIsDark(!isDark)}>
          <i className={`fa-solid ${isDark ? 'fa-sun text-amber-500' : 'fa-moon text-indigo-400'}`}></i>
          {isDark ? 'Light' : 'Dark'} Mode
        </Button>
      </header>

      <main className="flex-grow pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {activePage === 'home' && <Home navigateTo={setActivePage} openRsvpModal={openRsvpModal} />}
        {activePage === 'events' && <Events openRsvpModal={openRsvpModal} navigateTo={setActivePage} />}
        {activePage === 'register' && <Register onPassGenerated={openPassModal} />}
        {activePage === 'team' && <Team />}
      </main>

      <Modal isOpen={modalData.isOpen} onClose={() => setModalData({ ...modalData, isOpen: false })} title={modalData.title}>
        {modalData.content}
      </Modal>
    </div>
  );
}