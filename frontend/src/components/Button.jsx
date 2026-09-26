import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '', disabled = false }) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-display text-[13px] font-bold tracking-wide transition-all duration-300 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 whitespace-nowrap';
  const styles = {
    primary:
      'px-7 py-3.5 text-white bg-gradient-brand border-glow hover:-translate-y-0.5 hover:brightness-110 shadow-card',
    gold:
      'px-7 py-3.5 text-[#1A1405] bg-gradient-gold border-glow-gold hover:-translate-y-0.5 hover:brightness-105 shadow-card',
    secondary:
      'px-7 py-3.5 glass-panel text-emerald-900 dark:text-white border hover:-translate-y-0.5 hover:border-emerald-500/60 hover:shadow-glow',
    outline:
      'px-6 py-3 text-emerald-700 dark:text-emerald-300 border border-emerald-600/30 hover:bg-emerald-500 hover:text-white hover:border-emerald-500',
    dark: 'px-7 py-3.5 bg-ink-950 text-cream-50 hover:-translate-y-0.5 shadow-card dark:bg-cream-50 dark:text-ink-950',
    cta: 'btn-cta-ghost px-7 py-3.5 hover:-translate-y-0.5',
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant] || styles.primary} ${className} ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {children}
    </button>
  );
};
