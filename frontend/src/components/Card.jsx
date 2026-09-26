import React from 'react';

export const Card = ({ children, className = '', hover = false, hairline = false }) => (
  <div
    className={`glass-panel rounded-[22px] p-6 sm:p-7 shadow-card relative overflow-hidden transition-all duration-300 ${
      hover ? 'hover:-translate-y-1.5 hover:shadow-premium-dark hover:border-emerald-500/35' : ''
    } ${hairline ? 'card-hairline' : ''} ${className}`}
  >
    {children}
  </div>
);
