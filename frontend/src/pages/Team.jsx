import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api, photoUrl } from '../lib/api';

// Local team member photo imports from frontend/src/images/team/ directory.
import rishiImg from '../images/team/RISHI KUMAR MISHRA.jpg';
import atulImg from '../images/team/Atul Sahane.jpg';
import sauravImg from '../images/team/Saurav jha.jpg';
import maksudImg from '../images/team/Shaik Maksud Ahmad.jpg';
import jahanImg from '../images/team/Jahan Ara khan.jpg';
import praveenImg from '../images/team/M.D Praveen.jpg';
import ashirwadImg from '../images/team/Ashirwad Deshmukh.png';
import jayeshImg from '../images/team/Jayesh Ranjit Patil.jpg';
import darshanaImg from '../images/team/Darshana kushwaha.jpg';
import manishImg from '../images/team/Manish patil.jpg';
import aparnaImg from '../images/team/Aparna Sambhari.jpg';
import ankitImg from '../images/team/Ankit tiwari.jpg';
import mansiImg from '../images/team/mansi nikumbh.jpg';
import pratimaImg from '../images/team/Pratima.png';
import komalSonawaneImg from '../images/team/Komal Sonawane.jpg';
import siddamImg from '../images/team/Siddam Vaibhav.jpg';
import rohanImg from '../images/team/Rohan kolla.jpg';
import tejasImg from '../images/team/Tejas Adhav Patil.jpg';
import yashImg from '../images/team/Yash dange.jpg';
import prathameshImg from '../images/team/Prathamesh patil.jpg';

// Confident name-to-image mapping
const LOCAL_PHOTOS = {
  'rishi kumar mishra': rishiImg,
  'atul sahane': atulImg,
  'saurav jha': sauravImg,
  'shaik maksud ahmad': maksudImg,
  'jahan ara khan': jahanImg,
  'm.d. praveen': praveenImg,
  'm.d praveen': praveenImg,
  'ashirwad deshmukh': ashirwadImg,
  'jayesh ranjit patil': jayeshImg,
  'darshana kushwaha': darshanaImg,
  'manish patil': manishImg,
  'aparna sambhari': aparnaImg,
  'ankit tiwari': ankitImg,
  'mansi nikumbh': mansiImg,
  'pratima': pratimaImg,
  'komal sonawane': komalSonawaneImg,
  'siddam vaibhav': siddamImg,
  'rohan kolla': rohanImg,
  'tejas adhav patil': tejasImg,
  'yash dange': yashImg,
  'prathmesh patil': prathameshImg,
  'prathamesh patil': prathameshImg,
};

// Custom focal positioning so faces are naturally framed across portrait & standing photos
const PHOTO_POSITIONS = {
  'ankit tiwari': 'object-[center_10%]',
  'komal sonawane': 'object-[center_12%]',
  'jahan ara khan': 'object-[center_35%]',
  'shaik maksud ahmad': 'object-[center_45%]',
  'tejas adhav patil': 'object-[center_45%]',
  'm.d. praveen': 'object-[center_45%]',
  'm.d praveen': 'object-[center_45%]',
  'siddam vaibhav': 'object-center',
  'prathmesh patil': 'object-[center_18%]',
  'prathamesh patil': 'object-[center_18%]',
};

const socialIcon = (label = '') => {
  const l = label.toLowerCase();
  if (l.includes('linkedin')) return 'fa-brands fa-linkedin-in';
  if (l.includes('github')) return 'fa-brands fa-github';
  if (l.includes('instagram')) return 'fa-brands fa-instagram';
  if (l.includes('twitter')) return 'fa-brands fa-x-twitter';
  if (l.includes('youtube')) return 'fa-brands fa-youtube';
  return 'fa-solid fa-globe';
};

export const Team = ({ navigateTo }) => {
  const [cat, setCat] = useState('ALL');

  const fallbackMembers = [
    { name: 'Rishi Kumar Mishra', role: 'President', category: 'Presidents', year: '3rd Year', branch: 'N/A', bio: 'Owns the vision — partnerships, incubation strategy and the ecosystem roadmap.' },
    { name: 'Atul Sahane', role: 'Vice President', category: 'Presidents', year: '3rd Year', branch: 'N/A', bio: 'Runs cross-team operations, pitch programs and founder support.' },
    { name: 'Saurav Jha', role: 'Secretary', category: 'Secretaries', year: '3rd Year', branch: 'N/A', bio: 'Keeps the institution running — compliance, records, official correspondence.' },
    { name: 'Shaik Maksud Ahmad', role: 'Secretary', category: 'Secretaries', year: '3rd Year', branch: 'N/A', bio: 'Connects teams, outreach and day-to-day operational tracking.' },
    { name: 'Jahan Ara Khan', role: 'Treasurer', category: 'Treasurers', year: '3rd Year', branch: 'N/A', bio: 'Guards the money — budgets, event spends and grant tracking.' },
    { name: 'M.D. Praveen', role: 'Technical Team Head', category: 'Technical', year: '3rd Year', branch: 'N/A', bio: 'Architects the portals, platforms and digital infrastructure.' },
    { name: 'Ashirwad Deshmukh', role: 'Technical Team Co-Head', category: 'Technical', year: '3rd Year', branch: 'N/A', bio: 'Co-leads backend integrations and platform reliability.' },
    { name: 'Jayesh Ranjit Patil', role: 'Technical Team Co-Head', category: 'Technical', year: '3rd Year', branch: 'N/A', bio: 'Crafts frontend interfaces and design systems.' },
    { name: 'Darshana Kushwaha', role: 'Event Team Head', category: 'Event & Marketing', year: '3rd Year', branch: 'N/A', bio: 'Designs pitch nights, workshops and venue experiences.' },
    { name: 'Manish Patil', role: 'Event Team Co-Head', category: 'Event & Marketing', year: '3rd Year', branch: 'N/A', bio: 'Owns logistics, hospitality and stage management.' },
    { name: 'Komal Pimple', role: 'Event Team Member', category: 'Event & Marketing', year: 'N/A', branch: 'N/A', bio: 'Runs registrations and on-ground coordination.' },
    { name: 'Aparna Sambhari', role: 'Marketing Team Head', category: 'Event & Marketing', year: '3rd Year', branch: 'N/A', bio: 'Leads campaigns that fill every seat on pitch night.' },
    { name: 'Ankit Tiwari', role: 'Social Media Team Head', category: 'Media & Engagement', year: '3rd Year', branch: 'N/A', bio: 'Directs channels, branding and announcements.' },
    { name: 'Mansi Nikumbh', role: 'Social Media Team Co-Head', category: 'Media & Engagement', year: '3rd Year', branch: 'N/A', bio: 'Creates the visuals and content the campus shares.' },
    { name: 'Pratima', role: 'Student Engagement Head', category: 'Media & Engagement', year: '3rd Year', branch: 'N/A', bio: 'Guides first-timers from signup to stage-ready.' },
    { name: 'Komal Sonawane', role: 'Student Engagement Co-Head', category: 'Media & Engagement', year: '3rd Year', branch: 'N/A', bio: 'Answers queries and runs the support desks.' },
    { name: 'Mahesh Gaikwad', role: 'Videographer & Video Editor', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Shoots and edits event coverage and highlights.' },
    { name: 'Siddam Vaibhav', role: 'Videographer & Video Editor', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Handles cinematography and post-production.' },
    { name: 'Kamsali Yashwanth', role: 'Videographer & Video Editor', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Directs shoots, montages and visual stories.' },
    { name: 'Rohan Kolla', role: 'Videographer', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Captures the moments that matter on event day.' },
    { name: 'Chityala Manikanteswarareddy', role: 'Video Editor', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Cuts promos, reels and pitch-night highlights.' },
    { name: 'Prathmesh Patil', role: 'Video Editor', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Designs teasers and recap edits.' },
    { name: 'Tejas Adhav Patil', role: 'Sponsorship Team Head', category: 'Sponsorship', year: '3rd Year', branch: 'N/A', bio: 'Builds corporate alliances and mentor links.' },
    { name: 'Yash Dange', role: 'Sponsorship Team Co-Head', category: 'Sponsorship', year: '3rd Year', branch: 'N/A', bio: 'Manages partners and the prize pool.' },
  ];

  // Live roster from the admin panel; merges with the built-in list so all 24 members are always present in production.
  const [remoteMembers, setRemoteMembers] = useState(null);
  useEffect(() => {
    api.teamPublic()
      .then((d) => {
        if (d && Array.isArray(d.items) && d.items.length > 0) {
          // Merge by name: keep all 24 fallbackMembers as the base, and overlay any remote updates (e.g. photos or details from admin)
          const remoteMap = new Map(d.items.map((m) => [(m.name || '').toLowerCase().trim(), m]));
          const merged = fallbackMembers.map((fb) => {
            const key = (fb.name || '').toLowerCase().trim();
            const remote = remoteMap.get(key);
            return remote ? { ...fb, ...remote } : fb;
          });
          // Also append any extra members added through the admin panel not in fallback
          const fbKeys = new Set(fallbackMembers.map((m) => (m.name || '').toLowerCase().trim()));
          d.items.forEach((m) => {
            const key = (m.name || '').toLowerCase().trim();
            if (!fbKeys.has(key)) merged.push(m);
          });
          setRemoteMembers(merged);
        }
      })
      .catch(() => {});
  }, []);
  const teamMembers = remoteMembers || fallbackMembers;

  const isGoverning = (m) => {
    const r = (m.role || '').toLowerCase();
    const c = (m.category || '').toLowerCase();
    return r.includes('president') || r.includes('secretary') || r.includes('treasurer') ||
           c === 'presidents' || c === 'secretaries' || c === 'treasurers' || c === 'governing body';
  };

  const isFaculty = (m) => {
    const r = (m.role || '').toLowerCase();
    const c = (m.category || '').toLowerCase();
    return r.includes('faculty') || c.includes('faculty');
  };

  const isAdvisor = (m) => {
    const r = (m.role || '').toLowerCase();
    const c = (m.category || '').toLowerCase();
    return r.includes('advisor') || c.includes('advisor');
  };

  // Groupings for team structure
  const governingMembers = teamMembers.filter(isGoverning);
  const facultyMembers = teamMembers.filter(isFaculty);
  const advisorMembers = teamMembers.filter(isAdvisor);

  const opTeamsDef = [
    {
      id: 'Sponsorship',
      name: 'Sponsorship Team',
      desc: 'Building corporate alliances, industry sponsorships, and partner relations.',
      filter: (m) => (m.category || '').toLowerCase() === 'sponsorship' || (m.role || '').toLowerCase().includes('sponsorship'),
    },
    {
      id: 'Technical',
      name: 'Technical Team',
      desc: 'Architecting web platforms, student portals, and digital infrastructure.',
      filter: (m) => (m.category || '').toLowerCase() === 'technical' || (m.role || '').toLowerCase().includes('technical'),
    },
    {
      id: 'Event & Marketing',
      name: 'Event & Marketing Team',
      desc: 'Designing pitch competitions, campus venue executions, and outreach campaigns.',
      filter: (m) => (m.category || '').toLowerCase() === 'event & marketing' || (m.role || '').toLowerCase().includes('event') || (m.role || '').toLowerCase().includes('marketing'),
    },
    {
      id: 'Media & Engagement',
      name: 'Media & Engagement Team',
      desc: 'Directing social media channels, digital branding, and student onboarding.',
      filter: (m) => (m.category || '').toLowerCase() === 'media & engagement' || (m.role || '').toLowerCase().includes('social media') || (m.role || '').toLowerCase().includes('engagement'),
    },
    {
      id: 'Media & Production',
      name: 'Media & Production Team',
      desc: 'Capturing event moments, cinematography, and post-production video editing.',
      filter: (m) => (m.category || '').toLowerCase() === 'media & production' || (m.role || '').toLowerCase().includes('video'),
    },
  ];

  const categories = [
    'ALL',
    'Governing Body',
    ...opTeamsDef.map((t) => t.id),
  ];

  const initials = (n) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const getMemberPhoto = (m) => {
    const norm = (m.name || '').toLowerCase().trim();
    if (LOCAL_PHOTOS[norm]) return LOCAL_PHOTOS[norm];
    if (m.photoUrl) return photoUrl(m.photoUrl);
    return null;
  };

  const getPhotoPosition = (m) => {
    const norm = (m.name || '').toLowerCase().trim();
    return PHOTO_POSITIONS[norm] || 'object-top';
  };

  const renderMemberCard = (m) => {
    const photo = getMemberPhoto(m);
    const posClass = getPhotoPosition(m);

    return (
      <motion.div
        key={m.name}
        layout
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.32 }}
      >
        <Card hover hairline className="h-full flex flex-col">
          {/* Photo Showcase without redundant inner border box */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 group/img shrink-0">
            {photo ? (
              <img
                src={photo}
                alt={m.name}
                className={`w-full h-full object-cover ${posClass} transition-transform duration-500 group-hover:scale-105`}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500/10 via-gold-500/10 to-transparent">
                <span className="w-16 h-16 rounded-2xl bg-gradient-brand text-white font-display font-extrabold text-2xl flex items-center justify-center border-glow shadow-card">
                  {initials(m.name)}
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-gold-500 uppercase mt-2.5 opacity-80">
                  Team Member
                </span>
              </div>
            )}
          </div>

          {/* Member Details */}
          <div className="flex-grow flex flex-col">
            <h3 className="font-display font-bold text-lg sm:text-xl leading-tight text-emerald-950 dark:text-white truncate" title={m.name}>
              {m.name}
            </h3>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-300 mt-1">
              {m.role}
            </div>

            <div className="flex flex-wrap gap-2 mt-auto pt-3.5 border-t border-black/10 dark:border-white/10 font-mono text-[10px] font-bold">
              {m.year && m.year !== 'N/A' && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  {m.year}
                </span>
              )}
              {!isGoverning(m) && m.branch && m.branch !== 'N/A' && (
                <span className="px-2.5 py-1 rounded-full border border-black/10 dark:border-white/15 opacity-70 max-w-full truncate" title={m.branch}>
                  {m.branch}
                </span>
              )}
            </div>

            {(m.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {m.tags.map((t) => (
                  <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {(m.socials || []).length > 0 && (
              <div className="flex gap-4 mt-3 text-sm opacity-70">
                {m.socials.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noreferrer" title={s.label} className="hover:text-gold-500 hover:opacity-100 transition">
                    <i className={socialIcon(s.label)} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-20 sm:-top-24 -left-4 sm:-left-8 -right-4 sm:-right-8 bottom-0 -z-10 overflow-hidden">
        <div className="floating-orb w-[460px] h-[460px] bg-gold-500/12 -top-24 -left-24" />
        <div className="absolute inset-0 grid-pattern" />
      </div>

      <motion.section initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="pt-8 sm:pt-12 text-center max-w-3xl mx-auto space-y-5">
        <span className="section-badge"><i className="fa-solid fa-users text-gold-500" /> The crew</span>
        <h1 className="section-title font-display text-4xl sm:text-6xl font-extrabold text-balance">
          Students running a <span className="text-gradient-gold">startup engine.</span>
        </h1>
        <p className="section-subtitle text-sm sm:text-base">Presidents to video editors — {teamMembers.length} builders across organized teams keeping the Launchpad flying.</p>

        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider border transition ${
                cat === c
                  ? 'bg-gradient-gold text-[#1A1405] border-transparent border-glow-gold'
                  : 'text-slate-500 dark:text-cream-100/75 opacity-80 hover:opacity-100 hover:text-emerald-950 dark:hover:text-white border-black/15 dark:border-white/15 lux-pill'
              }`}
            >
              {c === 'ALL' ? `All · ${teamMembers.length}` : c}
            </button>
          ))}
        </div>
      </motion.section>

      {/* TEAM SECTIONS */}
      <div className="mt-12 space-y-16">
        {/* Governing Leadership Body */}
        {(cat === 'ALL' || cat === 'Governing Body') && governingMembers.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-black/10 dark:border-white/10 pb-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500">Core Governance</span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-white mt-1">
                Governing Leadership Body
              </h2>
              <p className="text-xs sm:text-sm section-subtitle mt-1">
                Directing strategic vision, administration, compliance, and institutional allocations.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {governingMembers.map(renderMemberCard)}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Faculty Coordinator (rendered dynamically if existing in data) */}
        {(cat === 'ALL' || cat.toLowerCase().includes('faculty')) && facultyMembers.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-black/10 dark:border-white/10 pb-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">University Mentorship</span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-white mt-1">
                Faculty Coordinator
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {facultyMembers.map(renderMemberCard)}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Club Advisor (rendered dynamically if existing in data) */}
        {(cat === 'ALL' || cat.toLowerCase().includes('advisor')) && advisorMembers.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-black/10 dark:border-white/10 pb-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Advisory Board</span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-white mt-1">
                Club Advisor
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {advisorMembers.map(renderMemberCard)}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Operational Teams */}
        {opTeamsDef.map((team) => {
          if (cat !== 'ALL' && cat !== team.id) return null;
          const members = teamMembers.filter(team.filter);
          if (members.length === 0) return null;

          return (
            <section key={team.id} className="space-y-6">
              <div className="border-b border-black/10 dark:border-white/10 pb-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500">Operational Team</span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-white mt-1">
                  {team.name}
                </h2>
                <p className="text-xs sm:text-sm section-subtitle mt-1">
                  {team.desc}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {members.map(renderMemberCard)}
                </AnimatePresence>
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-14 mb-6">
        <div className="rounded-[24px] spotlight text-white p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 noise relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <div className="font-mono text-[10px] tracking-[0.25em] text-gold-300">OPEN CALL · VOLUNTEERS &amp; LEADS</div>
            <h3 className="font-display text-2xl font-bold mt-2">Want your name on this wall next?</h3>
            <p className="text-sm text-cream-100/60 mt-1">Join as a volunteer this semester, grow into a team lead.</p>
          </div>
          <Button variant="gold" onClick={() => navigateTo && navigateTo('register')} className="relative shrink-0">Apply as founder <i className="fa-solid fa-arrow-right text-xs" /></Button>
        </div>
      </section>
    </div>
  );
};
