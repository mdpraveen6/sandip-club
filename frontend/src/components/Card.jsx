import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`glass-panel p-6 rounded-3xl border border-slate-200 dark:border-blue-500/20 shadow-md ${className}`}>
    {children}
  </div>
);