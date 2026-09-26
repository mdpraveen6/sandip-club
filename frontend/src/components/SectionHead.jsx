import React from 'react';
import { motion } from 'framer-motion';

export const SectionHead = ({ eyebrow, index, title, sub, align = 'center' }) => {
  const centered = align === 'center';
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`space-y-4 ${centered ? 'text-center mx-auto max-w-3xl' : 'text-left max-w-2xl'}`}
    >
      <div className={`flex items-center gap-3 ${centered ? 'justify-center' : 'justify-start'}`}>
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold-500" />
        <span className="eyebrow">
          {index ? `${index} — ` : ''}{eyebrow}
        </span>
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold-500" />
      </div>
      <h2 className="section-title text-3xl sm:text-4xl lg:text-[2.9rem] text-balance">{title}</h2>
      {sub && <p className={`section-subtitle text-sm sm:text-base ${centered ? 'mx-auto' : ''}`}>{sub}</p>}
    </motion.div>
  );
};
