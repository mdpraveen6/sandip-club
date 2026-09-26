import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '' }) => {
  const base = "px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-2 active:scale-95";
  const styles = {
    primary: "bg-gradient-blue text-white shadow-lg border-glow hover:opacity-95",
    secondary: "glass-panel text-slate-800 dark:text-white border border-slate-300 dark:border-blue-500/20 hover:border-blue-500",
    outline: "bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-600 text-blue-600 dark:text-blue-300 hover:text-white border border-blue-200 dark:border-blue-500/30"
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};