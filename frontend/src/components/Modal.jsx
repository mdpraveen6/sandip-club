import React from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-navy-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-blue-500/30 relative text-slate-900 dark:text-white shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-white flex items-center justify-center"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
};