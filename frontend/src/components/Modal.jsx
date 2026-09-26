import React from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full rounded-[24px] relative overflow-hidden shadow-premium-dark animate-scale-in bg-cream-50 text-emerald-950 dark:bg-ink-900 dark:text-white border border-emerald-900/20 dark:border-emerald-500/25"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-emerald-600 via-gold-400 to-emerald-600 bg-[length:200%_100%] animate-gradient-x" />
        <div className="p-6 sm:p-8">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 text-slate-500 dark:text-cream-100 hover:bg-emerald-500 hover:text-white transition flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark" />
          </button>
          {title && <h3 className="font-display text-xl font-bold mb-5 pr-10">{title}</h3>}
          {children}
        </div>
      </div>
    </div>
  );
};
