import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Register = ({ onPassGenerated }) => {
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    prn: '',
    school: 'SOCSE - School of Computer Sciences & Engineering',
    academicYear: '2nd Year',
    gender: 'Male',
    email: '',
    phone: '',
    
    // Idea & Project Details
    ideaTitle: '',
    domain: 'Artificial Intelligence & SaaS',
    problemStatement: '',
    solutionOverview: '',
    teamType: 'Solo Founder',
    pitchDeckUrl: '',
    hasDoc: false
  });

  const [fileName, setFileName] = useState('');

  // Official Sandip University Schools List
  const sandipSchools = [
    "SOCSE - School of Computer Sciences & Engineering",
    "SOET - School of Engineering & Technology",
    "SOL - School of Law",
    "SOMS - School of Management Studies",
    "SOP - School of Pharmaceutical Sciences",
    "SOD - School of Design",
    "SOS - School of Science",
    "SOSA - School of Agricultural Sciences"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData({ ...formData, pitchDeckUrl: file.name, hasDoc: true });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPassGenerated({
      name: formData.fullName,
      prn: formData.prn,
      school: formData.school.split(' - ')[0],
      dept: formData.school.split(' - ')[1] || formData.school,
      title: formData.ideaTitle,
      domain: formData.domain,
      ref: "SEBC-2026-" + Math.floor(10000 + Math.random() * 90000),
      timestamp: "ISSUED: " + new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      
      {/* ================= PAGE HEADER ================= */}
      <section className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
          <i className="fa-solid fa-id-card text-blue-500"></i> SUN Launchpad 2026 Cohort
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Register Startup Idea & Pitch
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Submit your concept to participate in Round 1. Receive your verified Digital Founder Pass and unlock SCIIE incubation mentorship.
        </p>
      </section>

      {/* ================= REGISTRATION FORM ================= */}
      <Card className="p-8 sm:p-12 border-2 border-blue-500/30 shadow-2xl relative">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* SECTION 1: PERSONAL & ACADEMIC PROFILE */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-blue-500/20 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Personal & Academic Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Full Name <span className="text-blue-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Sandip PRN */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Sandip PRN / Roll Number <span className="text-blue-500">*</span>
                </label>
                <input
                  type="text"
                  name="prn"
                  required
                  placeholder="e.g. 220101234001"
                  value={formData.prn}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* School / Department */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  School / Institute Name <span className="text-blue-500">*</span>
                </label>
                <select
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                >
                  {sandipSchools.map((sch, i) => (
                    <option key={i} value={sch} className="bg-white dark:bg-navy-900 text-slate-900 dark:text-white">
                      {sch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Current Academic Year <span className="text-blue-500">*</span>
                </label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                >
                  {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate / M.Tech / MBA', 'Alumni / Researcher'].map((yr, i) => (
                    <option key={i} value={yr} className="bg-white dark:bg-navy-900 text-slate-900 dark:text-white">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Gender <span className="text-blue-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other / Prefer not to say">Other / Prefer not to say</option>
                </select>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Sandip Email Address <span className="text-blue-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@sandipuniversity.edu.in"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  WhatsApp Contact Number <span className="text-blue-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PROJECT & IDEA DETAILS */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-blue-500/20 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Startup & Pitch Specifications
              </h2>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Startup / Idea Title <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ideaTitle"
                    required
                    placeholder="e.g. AgriTech Automated Drone"
                    value={formData.ideaTitle}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Domain Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Industry / Sector Domain <span className="text-blue-500">*</span>
                  </label>
                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    {[
                      'Artificial Intelligence & SaaS',
                      'Healthcare & BioTech',
                      'AgriTech & Rural Innovation',
                      'FinTech & Blockchain',
                      'CleanTech & Renewable Energy',
                      'EdTech & Social Impact',
                      'Hardware, Robotics & IoT',
                      'Consumer / E-Commerce'
                    ].map((d, i) => (
                      <option key={i} value={d} className="bg-white dark:bg-navy-900 text-slate-900 dark:text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Team Setup */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Participation Structure <span className="text-blue-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Solo Founder', '2 Co-Founders', '3-4 Team Members'].map((structure) => (
                    <button
                      key={structure}
                      type="button"
                      onClick={() => setFormData({ ...formData, teamType: structure })}
                      className={`p-3 rounded-xl font-mono text-xs font-bold border transition text-center ${
                        formData.teamType === structure
                          ? 'bg-gradient-blue text-white border-blue-500 shadow-md'
                          : 'bg-slate-50 dark:bg-navy-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-blue-500/15'
                      }`}
                    >
                      {structure}
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Statement */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Problem Statement <span className="text-blue-500">*</span>
                </label>
                <textarea
                  name="problemStatement"
                  rows="3"
                  required
                  placeholder="What exact problem or inefficiency are you addressing? Who experiences this problem?"
                  value={formData.problemStatement}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition leading-relaxed"
                ></textarea>
              </div>

              {/* Proposed Solution */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Proposed Solution & Vision <span className="text-blue-500">*</span>
                </label>
                <textarea
                  name="solutionOverview"
                  rows="3"
                  required
                  placeholder="Explain your approach or product idea. How does it solve the problem effectively?"
                  value={formData.solutionOverview}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition leading-relaxed"
                ></textarea>
              </div>

              {/* Pitch Deck / Document Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Upload PPT / Pitch Deck / PDF Proposal <span className="text-slate-400">(Optional)</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-blue-500/30 rounded-2xl p-6 text-center hover:border-blue-500 transition relative bg-slate-50/50 dark:bg-navy-950/50">
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <i className="fa-solid fa-cloud-arrow-up text-blue-500 text-2xl"></i>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {fileName ? `Uploaded: ${fileName}` : "Click or drag your PPT/PDF pitch document here"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Supports PDF, PPTX up to 15MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT ACTION */}
          <div className="pt-4 border-t border-slate-200 dark:border-blue-500/20">
            <Button type="submit" className="w-full py-4 text-xs tracking-wider shadow-xl border-glow">
              <i className="fa-solid fa-id-card mr-2"></i> Generate Verified Founder Pass & Register
            </Button>
          </div>

        </form>
      </Card>

    </div>
  );
};