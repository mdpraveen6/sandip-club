import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
import krishImg from '../images/team/Krish.jpg';

// Confident name-to-image mapping
const LOCAL_PHOTOS = {
  'krish dodani': krishImg,
  'krish': krishImg,
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

// Carefully tailored framing and positioning per photo to prevent awkward cropping
const PHOTO_CONFIG = {
  'ankit tiwari': { objectFit: 'cover', objectPosition: 'center 8%' },
  'komal sonawane': { objectFit: 'cover', objectPosition: 'center 12%' },
  'darshana kushwaha': { objectFit: 'cover', objectPosition: 'center 12%' },
  'jahan ara khan': { objectFit: 'cover', objectPosition: 'center 22%' },
  'shaik maksud ahmad': { objectFit: 'cover', objectPosition: 'center 46%', transform: 'scale(1.18)' },
  'tejas adhav patil': { objectFit: 'cover', objectPosition: 'center 46%', transform: 'scale(1.18)' },
  'm.d. praveen': { objectFit: 'cover', objectPosition: 'center 48%', transform: 'scale(1.2)' },
  'm.d praveen': { objectFit: 'cover', objectPosition: 'center 48%', transform: 'scale(1.2)' },
  'siddam vaibhav': { objectFit: 'cover', objectPosition: 'center 28%', transform: 'scale(1.25)' },
  'mansi nikumbh': { objectFit: 'cover', objectPosition: 'center 15%' },
  'atul sahane': { objectFit: 'cover', objectPosition: 'center 15%' },
  'jayesh ranjit patil': { objectFit: 'cover', objectPosition: 'center 15%' },
  'ashirwad deshmukh': { objectFit: 'cover', objectPosition: 'center 12%' },
  'prathamesh patil': { objectFit: 'cover', objectPosition: 'center 14%' },
  'prathmesh patil': { objectFit: 'cover', objectPosition: 'center 14%' },
  'krish dodani': { objectFit: 'cover', objectPosition: 'center 12%' },
  'krish': { objectFit: 'cover', objectPosition: 'center 12%' },
  'rishi kumar mishra': { objectFit: 'cover', objectPosition: 'center 15%' },
  'saurav jha': { objectFit: 'cover', objectPosition: 'center 15%' },
  'manish patil': { objectFit: 'cover', objectPosition: 'center 15%' },
  'aparna sambhari': { objectFit: 'cover', objectPosition: 'center 15%' },
  'pratima': { objectFit: 'cover', objectPosition: 'center 12%' },
  'rohan kolla': { objectFit: 'cover', objectPosition: 'center 15%' },
  'yash dange': { objectFit: 'cover', objectPosition: 'center 15%' },
};

export const Team = ({ navigateTo }) => {
  const [cat, setCat] = useState('ALL');
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [screenSize, setScreenSize] = useState('desktop');
  const dragRef = useRef({ startX: 0, isDragging: false });

  // Responsive screen breakpoint
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setScreenSize('mobile');
      else if (w < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Team array ordered explicitly:
  // 1. Club Advisor
  // 2. Leadership Team (Presidents, Secretaries, Treasurer)
  // 3. Sponsorship Team (Immediately follows Leadership)
  // 4. Technical Team (Immediately follows Sponsorship)
  // 5. Event & Marketing Team
  // 6. Media & Engagement Team
  // 7. Media & Production Team (Prathamesh first)
  const fallbackMembers = [
    { name: 'Krish Dodani', role: 'Sun Entrepreneurship Club Advisor', category: 'Advisor', year: '3rd Year', branch: 'N/A', bio: 'Guiding club initiatives, strategic development, and founder mentorship.' },
    { name: 'Rishi Kumar Mishra', role: 'President', category: 'Presidents', year: '3rd Year', branch: 'N/A', bio: 'Owns the vision — partnerships, incubation strategy and the ecosystem roadmap.' },
    { name: 'Atul Sahane', role: 'Vice President', category: 'Presidents', year: '3rd Year', branch: 'N/A', bio: 'Runs cross-team operations, pitch programs and founder support.' },
    { name: 'Saurav Jha', role: 'Secretary', category: 'Secretaries', year: '3rd Year', branch: 'N/A', bio: 'Keeps the institution running — compliance, records, official correspondence.' },
    { name: 'Shaik Maksud Ahmad', role: 'Secretary', category: 'Secretaries', year: '3rd Year', branch: 'N/A', bio: 'Connects teams, outreach and day-to-day operational tracking.' },
    { name: 'Jahan Ara Khan', role: 'Treasurer', category: 'Treasurers', year: '3rd Year', branch: 'N/A', bio: 'Guards the money — budgets, event spends and grant tracking.' },
    { name: 'Tejas Adhav Patil', role: 'Sponsorship Team Head', category: 'Sponsorship', year: '3rd Year', branch: 'N/A', bio: 'Builds corporate alliances and mentor links.' },
    { name: 'Yash Dange', role: 'Sponsorship Team Co-Head', category: 'Sponsorship', year: '3rd Year', branch: 'N/A', bio: 'Manages partners and the prize pool.' },
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
    { name: 'Prathamesh Patil', role: 'Video Editor', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Designs teasers and recap edits.' },
    { name: 'Mahesh Gaikwad', role: 'Videographer & Video Editor', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Shoots and edits event coverage and highlights.' },
    { name: 'Siddam Vaibhav', role: 'Videographer & Video Editor', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Handles cinematography and post-production.' },
    { name: 'Kamsali Yashwanth', role: 'Videographer & Video Editor', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Directs shoots, montages and visual stories.' },
    { name: 'Rohan Kolla', role: 'Videographer', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Captures the moments that matter on event day.' },
    { name: 'Chityala Manikanteswarareddy', role: 'Video Editor', category: 'Media & Production', year: 'N/A', branch: 'N/A', bio: 'Cuts promos, reels and pitch-night highlights.' },
  ];

  // Live roster from the admin panel; merges with the built-in list preserving order
  const [remoteMembers, setRemoteMembers] = useState(null);
  useEffect(() => {
    api.teamPublic()
      .then((d) => {
        if (d && Array.isArray(d.items) && d.items.length > 0) {
          const remoteMap = new Map(d.items.map((m) => [(m.name || '').toLowerCase().trim(), m]));
          const merged = fallbackMembers.map((fb) => {
            const key = (fb.name || '').toLowerCase().trim();
            const remote = remoteMap.get(key) || (key === 'prathamesh patil' ? remoteMap.get('prathmesh patil') : null);
            return remote ? { ...fb, ...remote } : fb;
          });
          const fbKeys = new Set(fallbackMembers.flatMap((m) => {
            const k = (m.name || '').toLowerCase().trim();
            return k === 'prathamesh patil' ? ['prathamesh patil', 'prathmesh patil'] : [k];
          }));
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
           c === 'presidents' || c === 'secretaries' || c === 'treasurers' || c.includes('governing') || c.includes('leadership');
  };

  const isAdvisor = (m) => {
    const r = (m.role || '').toLowerCase();
    const c = (m.category || '').toLowerCase();
    return r.includes('advisor') || c.includes('advisor');
  };

  const opTeamsDef = [
    {
      id: 'Sponsorship',
      name: 'Sponsorship',
      filter: (m) => (m.category || '').toLowerCase() === 'sponsorship' || (m.role || '').toLowerCase().includes('sponsorship'),
    },
    {
      id: 'Technical',
      name: 'Technical',
      filter: (m) => (m.category || '').toLowerCase() === 'technical' || (m.role || '').toLowerCase().includes('technical'),
    },
    {
      id: 'Event & Marketing',
      name: 'Event & Marketing',
      filter: (m) => (m.category || '').toLowerCase() === 'event & marketing' || (m.role || '').toLowerCase().includes('event') || (m.role || '').toLowerCase().includes('marketing'),
    },
    {
      id: 'Media & Engagement',
      name: 'Media & Engagement',
      filter: (m) => (m.category || '').toLowerCase() === 'media & engagement' || (m.role || '').toLowerCase().includes('social media') || (m.role || '').toLowerCase().includes('engagement'),
    },
    {
      id: 'Media & Production',
      name: 'Media & Production',
      filter: (m) => (m.category || '').toLowerCase() === 'media & production' || (m.role || '').toLowerCase().includes('video') || (m.role || '').toLowerCase().includes('photograph'),
    },
  ];

  const categories = [
    'ALL',
    'Club Advisor',
    'Leadership Team',
    ...opTeamsDef.map((t) => t.id),
  ];

  const getMemberSection = (m) => {
    if (isAdvisor(m)) return 'Club Advisor';
    if (isGoverning(m)) return 'Leadership Team';
    const c = (m.category || '').toLowerCase();
    const r = (m.role || '').toLowerCase();
    if (c === 'sponsorship' || r.includes('sponsorship')) return 'Sponsorship';
    if (c === 'technical' || r.includes('technical')) return 'Technical';
    if (c === 'event & marketing' || r.includes('event') || r.includes('marketing')) return 'Event & Marketing';
    if (c === 'media & engagement' || r.includes('social media') || r.includes('engagement')) return 'Media & Engagement';
    if (c === 'media & production' || r.includes('video') || r.includes('photograph')) return 'Media & Production';
    return m.category || 'Team Member';
  };

  const getFilteredMembers = () => {
    if (cat === 'ALL') return teamMembers;
    if (cat === 'Club Advisor') return teamMembers.filter(isAdvisor);
    if (cat === 'Leadership Team' || cat === 'Governing Body') return teamMembers.filter(isGoverning);
    const op = opTeamsDef.find((t) => t.id === cat);
    if (op) return teamMembers.filter(op.filter);
    return teamMembers.filter((m) => (m.category || '').toLowerCase() === cat.toLowerCase());
  };

  const list = getFilteredMembers();

  // Reset to first member when category changes
  const handleCategorySelect = (selectedCat) => {
    setCat(selectedCat);
    setIdx(0);
    setProgress(0);
  };

  // Safe navigation delta
  const go = (delta) => {
    if (list.length <= 1) return;
    setIdx((prev) => (prev + delta + list.length) % list.length);
  };

  // Autoplay timer with progress ring updates
  const AUTOPLAY_MS = 3800;
  useEffect(() => {
    if (list.length <= 1) {
      setProgress(100);
      return;
    }
    let p = 0;
    setProgress(0);
    const tickInterval = 60;
    const step = 100 / (AUTOPLAY_MS / tickInterval);

    const tickTimer = setInterval(() => {
      p = Math.min(100, p + step);
      setProgress(p);
    }, tickInterval);

    const slideTimer = setInterval(() => {
      setIdx((prev) => (prev + 1) % list.length);
      p = 0;
      setProgress(0);
    }, AUTOPLAY_MS);

    return () => {
      clearInterval(tickTimer);
      clearInterval(slideTimer);
    };
  }, [idx, list.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [list.length]);

  // Pointer drag/swipe handling
  const handlePointerDown = (e) => {
    dragRef.current = { startX: e.clientX, isDragging: true };
  };
  const handlePointerUp = (e) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    const dx = e.clientX - dragRef.current.startX;
    if (dx > 45) {
      go(-1);
    } else if (dx < -45) {
      go(1);
    }
  };

  const initials = (n = '') =>
    n
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const getMemberPhoto = (m) => {
    const norm = (m.name || '').toLowerCase().trim();
    if (LOCAL_PHOTOS[norm]) return LOCAL_PHOTOS[norm];
    if (m.photoUrl) return photoUrl(m.photoUrl);
    return null;
  };

  const getPhotoStyle = (m) => {
    const norm = (m.name || '').toLowerCase().trim();
    return PHOTO_CONFIG[norm] || { objectFit: 'cover', objectPosition: 'center 15%' };
  };

  const currentMember = list[idx] || list[0] || null;
  const currentPhoto = currentMember ? getMemberPhoto(currentMember) : null;

  return (
    <div className="relative">
      {/* Background ambient pattern */}
      <div className="pointer-events-none absolute -top-20 sm:-top-24 -left-4 sm:-left-8 -right-4 sm:-right-8 bottom-0 -z-10 overflow-hidden">
        <div className="floating-orb w-[460px] h-[460px] bg-gold-500/12 -top-24 -left-24" />
        <div className="absolute inset-0 grid-pattern" />
      </div>

      {/* Header section */}
      <motion.section
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-8 sm:pt-12 text-center max-w-3xl mx-auto space-y-5"
      >
        <span className="section-badge">
          <i className="fa-solid fa-users text-gold-500" /> The crew
        </span>
        <h1 className="section-title font-display text-4xl sm:text-6xl font-extrabold text-balance">
          Students running a <span className="text-gradient-gold">startup engine.</span>
        </h1>
        <p className="section-subtitle text-sm sm:text-base">
          Presidents to video editors — {teamMembers.length} builders across organized teams keeping the Launchpad flying.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {categories.map((c) => {
            const count =
              c === 'ALL'
                ? teamMembers.length
                : c === 'Club Advisor'
                ? teamMembers.filter(isAdvisor).length
                : c === 'Leadership Team' || c === 'Governing Body'
                ? teamMembers.filter(isGoverning).length
                : opTeamsDef.find((t) => t.id === c)
                ? teamMembers.filter(opTeamsDef.find((t) => t.id === c).filter).length
                : teamMembers.filter((m) => (m.category || '').toLowerCase() === c.toLowerCase()).length;

            return (
              <button
                key={c}
                type="button"
                onClick={() => handleCategorySelect(c)}
                className={`px-4 py-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider border transition cursor-pointer ${
                  cat === c
                    ? 'bg-gradient-gold text-[#1A1405] border-transparent shadow-[0_0_18px_rgba(255,200,61,0.4)]'
                    : 'text-slate-400 dark:text-cream-100/75 opacity-80 hover:opacity-100 hover:text-emerald-950 dark:hover:text-white border-black/15 dark:border-white/15 lux-pill hover:border-gold-400/50'
                }`}
              >
                {c === 'ALL' ? `All · ${count}` : `${c.toUpperCase()} · ${count}`}
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* 3D PERSPECTIVE TEAM SLIDER STAGE - SIGNIFICANTLY ENLARGED */}
      <div className="mt-10 sm:mt-12 px-2 sm:px-4">
        <div className="relative max-w-[1320px] mx-auto rounded-[24px] sm:rounded-[36px] overflow-hidden h-[580px] sm:h-[680px] md:h-[740px] lg:h-[780px] border border-gold-500/30 bg-[#04140f] shadow-[0_30px_90px_rgba(0,0,0,0.75)] select-none">
          {/* Blurred Background Atmosphere */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {currentPhoto ? (
              <div
                key={currentPhoto}
                className="absolute -inset-[6%] bg-cover bg-center filter blur-[45px] saturate-[1.25] brightness-[0.42] scale-110 transition-all duration-700 ease-out"
                style={{ backgroundImage: `url(${currentPhoto})` }}
              />
            ) : (
              <div className="absolute -inset-[6%] bg-gradient-to-br from-emerald-900/25 via-transparent to-gold-500/15 filter blur-3xl" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#03110e]/60 via-[#03110e]/75 to-[#03110e]/95" />
            <div
              className="absolute inset-0 opacity-[0.14] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
              }}
            />
          </div>

          {/* 3D Perspective Track */}
          <div
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ perspective: '1400px' }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {list.map((m, i) => {
              let d = i - idx;
              const total = list.length;
              if (total > 1) {
                while (d > total / 2) d -= total;
                while (d < -total / 2) d += total;
              }
              const abs = Math.abs(d);
              const isActive = d === 0;

              // Generous responsive spacing and scale calculations for BIG card box
              const isMobile = screenSize === 'mobile';
              const spread = isMobile ? 180 : screenSize === 'tablet' ? 260 : 330;
              const zDist = -abs * (isMobile ? 120 : 160);
              const scale = isActive ? 1 : abs === 1 ? 0.8 : 0.58;
              const rot = d * 26;

              if (abs > 2) {
                return (
                  <div
                    key={`${m.name}-${i}`}
                    className="absolute w-[min(320px,78vw)] sm:w-[360px] md:w-[400px] lg:w-[440px] aspect-[3/4] opacity-0 pointer-events-none"
                    style={{
                      transform: `translateX(${d * spread}px) scale(0.4)`,
                      transition: 'transform 0.65s cubic-bezier(0.22, 0.9, 0.3, 1), opacity 0.65s ease, filter 0.65s ease',
                    }}
                  />
                );
              }

              const transform = `translateX(${d * spread}px) translateZ(${zDist}px) rotateY(${-rot}deg) scale(${scale})`;
              const zIndex = 10 - abs;
              const opacity = isActive ? 1 : abs === 1 ? 0.65 : 0.28;
              const filter = isActive ? 'none' : 'brightness(0.6) saturate(0.7)';
              const photo = getMemberPhoto(m);
              const photoStyle = getPhotoStyle(m);
              const memberSection = getMemberSection(m);

              return (
                <div
                  key={`${m.name}-${i}`}
                  onClick={() => {
                    if (!isActive) {
                      setIdx(i);
                    }
                  }}
                  className={`absolute w-[min(320px,78vw)] sm:w-[360px] md:w-[400px] lg:w-[440px] aspect-[3/4] rounded-[22px] sm:rounded-[28px] overflow-hidden cursor-pointer select-none ${
                    isActive
                      ? 'shadow-[0_32px_80px_rgba(0,0,0,0.75),0_0_0_2px_#ffc83d,0_0_45px_rgba(255,200,61,0.45)] border border-gold-400'
                      : 'shadow-[0_22px_55px_rgba(0,0,0,0.55)] border border-white/10'
                  }`}
                  style={{
                    transform,
                    zIndex,
                    opacity,
                    filter,
                    transition: 'transform 0.65s cubic-bezier(0.22, 0.9, 0.3, 1), opacity 0.65s ease, filter 0.65s ease, box-shadow 0.4s ease, border-color 0.4s ease',
                  }}
                >
                  {/* Subtle ambient backdrop behind portrait */}
                  {photo && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img
                        src={photo}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover blur-md scale-125 opacity-35"
                      />
                      <div className="absolute inset-0 bg-[#04140f]/60" />
                    </div>
                  )}

                  {/* Member Photo or Branded Initials Avatar */}
                  {photo ? (
                    <img
                      src={photo}
                      alt={m.name}
                      style={photoStyle}
                      className="relative z-10 w-full h-full select-none pointer-events-none transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900/40 via-ink-950 to-emerald-950/60 select-none">
                      <span className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-brand text-white font-display font-extrabold text-3xl sm:text-4xl flex items-center justify-center border-glow shadow-card">
                        {initials(m.name)}
                      </span>
                      <span className="font-mono text-xs sm:text-sm tracking-[0.2em] text-gold-400 uppercase mt-4 opacity-90">
                        {memberSection}
                      </span>
                    </div>
                  )}

                  {/* Bottom Vignette Shade */}
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                  {/* Active Card Gliding Caption - Bigger & Clearer */}
                  <div
                    className={`absolute left-0 right-0 bottom-0 z-30 p-5 sm:p-7 pointer-events-none transition-all duration-400 ease-out ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    <span className="block font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-gold-400 mb-1">
                      {memberSection}
                    </span>
                    <div className="font-display text-white text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight truncate">
                      {m.name}
                    </div>
                    <div className="font-mono text-gold-300 text-sm sm:text-base tracking-wide font-semibold mt-1 truncate">
                      {m.role}
                    </div>
                    {m.year && m.year !== 'N/A' && (
                      <span className="inline-block mt-3 font-mono text-xs sm:text-sm font-bold tracking-wider text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 rounded-full">
                        {m.year}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls: Previous / Next Arrows */}
          <button
            type="button"
            aria-label="Previous Team Member"
            onClick={() => go(-1)}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#04140f]/75 border border-gold-500/35 text-gold-300 hover:text-white hover:border-gold-400 hover:bg-gold-500/20 flex items-center justify-center z-30 backdrop-blur-md transition-all duration-200 shadow-xl cursor-pointer"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next Team Member"
            onClick={() => go(1)}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#04140f]/75 border border-gold-500/35 text-gold-300 hover:text-white hover:border-gold-400 hover:bg-gold-500/20 flex items-center justify-center z-30 backdrop-blur-md transition-all duration-200 shadow-xl cursor-pointer"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Infobar at Bottom */}
          <div className="absolute left-4 sm:left-8 right-4 sm:right-8 bottom-5 sm:bottom-6 flex items-center gap-3 sm:gap-5 z-30 pointer-events-auto">
            {/* Progress Ring with Member Index */}
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex-none flex items-center justify-center transition-all shadow-md"
              style={{
                background: `conic-gradient(#ffc83d ${progress}%, rgba(255,255,255,0.15) 0)`,
              }}
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#04140f] flex items-center justify-center font-mono text-[10px] sm:text-xs text-gold-400 font-bold">
                {idx + 1}
              </div>
            </div>

            {/* Active Member Info Text */}
            <div className="leading-tight min-w-0 flex-1">
              <b className="font-display font-bold text-sm sm:text-base md:text-lg text-white block truncate">
                {currentMember ? currentMember.name : '—'}
              </b>
              <span className="font-mono text-xs sm:text-sm text-emerald-300/80 tracking-wide block truncate mt-0.5">
                {currentMember
                  ? `${currentMember.role}${currentMember.year && currentMember.year !== 'N/A' ? ' · ' + currentMember.year : ''}`
                  : '—'}
              </span>
            </div>

            {/* Numeric Indicator and Navigation Dots */}
            <div className="flex items-center gap-2.5 ml-auto flex-shrink-0">
              <span className="font-mono text-xs sm:text-sm text-gold-400 font-bold">
                {idx + 1} <span className="opacity-40">/</span> {list.length}
              </span>
              <div className="hidden sm:flex items-center gap-1.5 max-w-[180px] md:max-w-[260px] overflow-hidden">
                {list.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to member ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === idx ? 'w-5 bg-gold-400' : 'w-1.5 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Banner */}
      <section className="mt-14 mb-6">
        <div className="rounded-[24px] spotlight text-white p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 noise relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <div className="font-mono text-[10px] tracking-[0.25em] text-gold-300">OPEN CALL · VOLUNTEERS &amp; LEADS</div>
            <h3 className="font-display text-2xl font-bold mt-2">Want your name on this wall next?</h3>
            <p className="text-sm text-cream-100/60 mt-1">Join as a volunteer this semester, grow into a team lead.</p>
          </div>
          <Button variant="gold" onClick={() => navigateTo && navigateTo('register')} className="relative shrink-0">
            Apply as founder <i className="fa-solid fa-arrow-right text-xs" />
          </Button>
        </div>
      </section>
    </div>
  );
};
