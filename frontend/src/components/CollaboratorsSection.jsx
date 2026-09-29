import React from 'react';
import { motion } from 'framer-motion';
import { SectionHead } from './SectionHead';

export const CollaboratorsSection = () => {
  const provides = [
    { icon: 'fa-server', title: 'Advanced Infrastructure' },
    { icon: 'fa-circle-nodes', title: 'Networking & Ecosystem Access' },
    { icon: 'fa-chalkboard-user', title: 'Expert Mentorship' },
    { icon: 'fa-laptop-code', title: 'Dedicated Workspace' },
  ];

  return (
    <section id="collaborators" className="pt-20 sm:pt-24 space-y-10 scroll-mt-24">
      <SectionHead
        index="07"
        eyebrow="Partnership"
        title="OUR COLLABORATORS"
        sub="Building opportunities through meaningful collaborations."
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-4xl"
      >
        <div className="relative rounded-[28px] overflow-hidden spotlight text-white noise border border-gold-500/35 bg-gradient-to-b from-emerald-950/70 via-[#071812]/90 to-ink-950/95 shadow-[0_0_45px_-10px_rgba(221,184,78,0.22)] p-6 sm:p-10 lg:p-12">
          {/* Top animated gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-gold-400 to-emerald-500 bg-[length:200%_100%] animate-gradient-x" />

          {/* Ambient gold glow behind card */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[220px] rounded-full bg-gold-500/10 blur-[90px]" />

          {/* Top block: Logo and Collaborator Details */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.25em] px-3.5 py-1.5 rounded-full border border-gold-500/40 bg-gold-500/[0.1] text-gold-300 uppercase">
              <i className="fa-solid fa-handshake text-xs" /> Official Incubation Partner
            </div>

            {/* Sandip TBI Logo Plate */}
            <div className="pt-2">
              <div className="inline-flex items-center justify-center bg-white rounded-2xl px-6 sm:px-10 py-3 sm:py-4 shadow-lg shadow-black/40 border border-gold-500/30 transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src="/sandip%20tbi%20logo.jpeg"
                  alt="Sandip TBI Logo"
                  className="h-12 sm:h-16 md:h-20 w-auto max-w-full object-contain"
                  onError={(e) => {
                    if (e.currentTarget.src.includes('%20')) {
                      e.currentTarget.src = '/sandip tbi logo.jpeg';
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-cream-50 tracking-tight">
                SANDIP TBI
              </h3>
              <p className="font-mono text-xs sm:text-sm text-gold-300/90 tracking-wider uppercase mt-1">
                Technology Business Incubator
              </p>
            </div>
          </div>

          <div className="gold-rule my-8 opacity-50" />

          {/* Subsection: WHAT SANDIP TBI PROVIDES */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="font-mono text-[10px] sm:text-xs font-bold tracking-[0.26em] text-gold-300 uppercase">
                OPPORTUNITIES &amp; RESOURCES
              </span>
              <h4 className="font-display text-lg sm:text-xl font-extrabold text-cream-50">
                WHAT SANDIP TBI PROVIDES
              </h4>
            </div>

            {/* 4 Feature Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {provides.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 hover:border-gold-500/50 hover:bg-white/[0.08] hover:-translate-y-0.5 shadow-sm"
                >
                  <span className="w-11 h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-300 flex items-center justify-center text-base shrink-0">
                    <i className={`fa-solid ${f.icon}`} />
                  </span>
                  <span className="font-display font-bold text-sm sm:text-base text-cream-50 leading-snug">
                    {f.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Supporting Line */}
            <div className="text-center pt-2">
              <span className="font-mono text-xs sm:text-sm text-cream-100/70 tracking-wide font-medium">
                &amp; Many Other Things
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
