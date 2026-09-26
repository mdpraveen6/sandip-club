import React, { useState } from 'react';
import { Card } from '../components/Card';

export const Team = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Image path placeholder
  const defaultAvatar = './images/sandiplogo.jpg';

  // Full Team Roster based on official structure
  const teamMembers = [
    // PRESIDENTS
    {
      name: "Rishi Kumar Mishra",
      role: "President",
      category: "Presidents",
      year: "3rd Year",
      branch: "Computer Science & Engineering",
      bio: "Overseeing strategic vision, incubation partnerships, and ecosystem development for SEBC."
    },
    {
      name: "Atul Sahane",
      role: "Vice President",
      category: "Presidents",
      year: "3rd Year",
      branch: "Engineering & Technology",
      bio: "Managing cross-departmental operations, pitch programs, and founder support workflows."
    },

    // SECRETARIES
    {
      name: "Saurav Jha",
      role: "Secretary",
      category: "Secretaries",
      year: "3rd Year",
      branch: "School of Management Studies",
      bio: "Directing institutional compliance, official correspondence, and administrative records."
    },
    {
      name: "Shaik Maksud Ahmad",
      role: "Secretary",
      category: "Secretaries",
      year: "3rd Year",
      branch: "Computer Science & Engineering",
      bio: "Coordinating inter-team communication, student outreach, and operational tracking."
    },

    // TREASURERS
    {
      name: "Jahan Ara Khan",
      role: "Treasurer",
      category: "Treasurers",
      year: "3rd Year",
      branch: "School of Management Studies",
      bio: "Managing financial allocation, event budgeting, and incubation grant tracking."
    },

    // TECHNICAL TEAM
    {
      name: "M.D. Praveen",
      role: "Technical Team Head",
      category: "Technical",
      year: "3rd Year",
      branch: "N/A",
      bio: "Architecting web platforms, student portals, and digital acceleration infrastructure."
    },
    {
      name: "Ashirwad Deshmukh",
      role: "Technical Team Co-Head",
      category: "Technical",
      year: "3rd Year",
      branch: "N/A",
      bio: "Co-leading technical platform updates, backend integrations, and platform maintenance."
    },
    {
      name: "Jayesh Ranjit Patil",
      role: "Technical Team Co-Head",
      category: "Technical",
      year: "3rd Year",
      branch: "N/A",
      bio: "Building frontend user interfaces, responsive design components, and web workflows."
    },

    // EVENT & MARKETING TEAM
    {
      name: "Darshana Kushwaha",
      role: "Event Team Head",
      category: "Event & Marketing",
      year: "3rd Year",
      branch: "N/A",
      bio: "Designing pitch competitions, workshop schedules, and campus venue executions."
    },
    {
      name: "Manish Patil",
      role: "Event Team Co-Head",
      category: "Event & Marketing",
      year: "3rd Year",
      branch: "N/A",
      bio: "Coordinating event logistics, judge hospitality, and stage management."
    },
    {
      name: "Komal Pimple",
      role: "Event Team Member",
      category: "Event & Marketing",
      year: "N/A",
      branch: "N/A",
      bio: "Assisting with campus event registrations and student venue coordination."
    },
    {
      name: "Aparna Sambhari",
      role: "Marketing Team Co-Head",
      category: "Event & Marketing",
      year: "3rd Year",
      branch: "N/A",
      bio: "Spearheading marketing strategy, campus campaigns, and awareness drives."
    },

    // MEDIA & ENGAGEMENT TEAM
    {
      name: "Ankit Tiwari",
      role: "Social Media Team Head",
      category: "Media & Engagement",
      year: "3rd Year",
      branch: "N/A",
      bio: "Directing social media channels, digital branding, and online announcements."
    },
    {
      name: "Mansi Nikumbh",
      role: "Social Media Team Co-Head",
      category: "Media & Engagement",
      year: "3rd Year",
      branch: "N/A",
      bio: "Creating visual content, campaign posts, and community media updates."
    },
    {
      name: "Pratima",
      role: "Student Engagement Head",
      category: "Media & Engagement",
      year: "3rd Year",
      branch: "N/A",
      bio: "Guiding students through idea submission, onboarding, and pitch readiness."
    },
    {
      name: "Komal Sonawane",
      role: "Student Engagement Co-Head",
      category: "Media & Engagement",
      year: "3rd Year",
      branch: "N/A",
      bio: "Answering student queries, managing support desks, and community chats."
    },

    // SPONSORSHIP & PARTNERSHIP
    {
      name: "Tejas Adhav Patil",
      role: "Sponsorship Team Head",
      category: "Sponsorship",
      year: "3rd Year",
      branch: "N/A",
      bio: "Building corporate alliances, industry sponsorships, and VC mentor links."
    },
    {
      name: "Yash Dange",
      role: "Sponsorship Team Co-Head",
      category: "Sponsorship",
      year: "3rd Year",
      branch: "N/A",
      bio: "Managing partner relations and pitch competition prize pool packages."
    }
  ];

  // Filter Categories Bar Options
  const categories = [
    { label: "All Members", value: "ALL" },
    { label: "Presidents", value: "Presidents" },
    { label: "Secretaries", value: "Secretaries" },
    { label: "Treasurers", value: "Treasurers" },
    { label: "Technical", value: "Technical" },
    { label: "Event & Marketing", value: "Event & Marketing" },
    { label: "Media & Engagement", value: "Media & Engagement" },
    { label: "Sponsorship", value: "Sponsorship" }
  ];

  const filteredMembers = teamMembers.filter(m => 
    selectedCategory === 'ALL' ? true : m.category === selectedCategory
  );

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto">
      
      {/* ================= HERO HEADER ================= */}
      <section className="text-center pt-4 space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
          <i className="fa-solid fa-users text-blue-500"></i> Entrepreneurship Club Directory
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Let's Meet Our Team
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          The student leaders, technical architects, and executive advisors driving Sandip University's startup ecosystem.
        </p>

        {/* ================= CATEGORY FILTER BUTTONS ================= */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition shadow-sm ${
                selectedCategory === cat.value
                  ? 'bg-gradient-blue text-white shadow-md border-glow'
                  : 'glass-panel text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-500/20 hover:border-blue-500'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ================= TEAM CARDS GRID (EXACTLY 3 CARDS PER ROW) ================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredMembers.map((member, index) => (
          <Card 
            key={index} 
            className="flex flex-col items-center text-center p-7 space-y-5 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-xl glass-panel relative overflow-hidden group"
          >
            {/* Top Glowing Border Highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Profile Avatar Frame */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/30 shadow-lg bg-slate-100 dark:bg-navy-900 shrink-0 group-hover:border-blue-500 transition-colors">
              <img 
                src={defaultAvatar} 
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name & Role Designation */}
            <div className="space-y-1.5 w-full">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                {member.name}
              </h3>
              <p className="text-xs font-mono font-bold text-blue-500 tracking-wide uppercase">
                {member.role}
              </p>
            </div>

            {/* Academic Badges (Year & Branch) */}
            <div className="flex flex-wrap justify-center gap-2 w-full font-mono text-[10px]">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                Year: {member.year}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-blue-500/20">
                Branch: {member.branch}
              </span>
            </div>

            {/* Member Description */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex-grow">
              {member.bio}
            </p>

            {/* Social Links */}
            <div className="pt-4 border-t border-slate-200 dark:border-blue-500/15 w-full flex justify-center gap-5 text-slate-400 text-xs">
              <a href="#twitter" className="hover:text-blue-500 transition">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="#website" className="hover:text-blue-500 transition">
                <i className="fa-solid fa-globe"></i>
              </a>
              <a href="#linkedin" className="hover:text-blue-500 transition">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>

          </Card>
        ))}
      </section>

    </div>
  );
};