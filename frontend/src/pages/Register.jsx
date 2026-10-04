import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { api } from '../lib/api';

const REQUIRED = ['fullName', 'prn', 'email', 'phone', 'ideaTitle', 'problemStatement', 'solutionOverview'];

// Module scope (NOT inside Register): defining it inside would recreate the
// component on every keystroke, remounting all inputs and stealing focus.
const Field = ({ label, req, children, span }) => (
  <div className={`space-y-2 ${span ? 'sm:col-span-2' : ''}`}>
    <label className="field-label">{label} {req && <span className="text-emerald-600 dark:text-emerald-300">*</span>}</label>
    {children}
  </div>
);

export const Register = ({ onApplicationReceived }) => {
  const [step, setStep] = useState(1);
  const [step1Error, setStep1Error] = useState('');
  const [showPptModal, setShowPptModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    prn: '',
    school: 'SOCSE - School of Computer Sciences & Engineering',
    academicYear: '2nd Year',
    gender: 'Male',
    email: '',
    phone: '',
    ideaTitle: '',
    domain: 'Artificial Intelligence & SaaS',
    problemStatement: '',
    solutionOverview: '',
    teamType: '1 member',
    pitchDeckUrl: '',
  });

  const [fileName, setFileName] = useState('');
  const [customSchool, setCustomSchool] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [deckFile, setDeckFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const sandipSchools = [
    'SOCSE - School of Computer Sciences & Engineering',
    'SOET - School of Engineering & Technology',
    'SOL - School of Law',
    'SOMS - School of Management Studies',
    'SOP - School of Pharmaceutical Sciences',
    'SOD - School of Design',
    'SOS - School of Science',
    'SOSA - School of Agricultural Sciences',
  ];
  const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate / M.Tech / MBA', 'Alumni / Researcher'];
  const domains = [
    'Artificial Intelligence & SaaS',
    'Healthcare & BioTech',
    'AgriTech & Rural Innovation',
    'FinTech & Blockchain',
    'CleanTech & Renewable Energy',
    'EdTech & Social Impact',
    'Hardware, Robotics & IoT',
    'Consumer / E-Commerce',
    'Other',
  ];
  const teamOptions = ['1 member', '2 members', '3–4 members'];

  const set = (name, value) => setFormData((p) => ({ ...p, [name]: value }));
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    set(name, type === 'checkbox' ? checked : value);
  };
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFileName(file.name);
      setDeckFile(file);
    }
  };

  const handleProceedToIdea = (e) => {
    if (e) e.preventDefault();
    setStep1Error('');
    if (!formData.fullName.trim()) {
      setStep1Error('Please enter your full name.');
      return;
    }
    if (!formData.prn.trim()) {
      setStep1Error('Please enter your Sandip PRN / Roll number.');
      return;
    }
    if (formData.school === 'Other' && !customSchool.trim()) {
      setStep1Error('Please specify your school / institute name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setStep1Error('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setStep1Error('Please enter your WhatsApp phone number.');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');

    const resolvedSchool = formData.school === 'Other' ? customSchool.trim() : formData.school;
    const resolvedDomain = formData.domain === 'Other' ? (customDomain.trim() || 'Other') : formData.domain;

    let deckUrl = '';
    if (deckFile) {
      try {
        const up = await api.uploadDeck(deckFile);
        deckUrl = up.url || '';
      } catch (e) {
        setSubmitting(false);
        setSubmitError(`Deck upload failed: ${e.message} — remove the file to submit without deck, or try again.`);
        return;
      }
    }
    const payload = {
      ...formData,
      school: resolvedSchool,
      domain: resolvedDomain,
      pitchDeckUrl: deckUrl,
    };
    try {
      await api.createRegistration(payload);
    } catch {
      setSubmitting(false);
      setSubmitError('Could not reach the server. Check your connection and try again — nothing was submitted.');
      return;
    }
    onApplicationReceived({ name: formData.fullName, title: formData.ideaTitle });
    setSubmitting(false);
  };

  const handleDownloadPptTemplate = () => {
    const content = `SUN LAUNCHPAD 2026 — PITCH DECK OUTLINE & TEMPLATE
Sun Entrepreneurship Club · Sandip University

SLIDE 1: TITLE & FOUNDER INFO
- Venture / Idea Name
- Tagline (1 sentence)
- Founder Name(s), PRN & Branch
- Contact Email & WhatsApp Number

SLIDE 2: THE PROBLEM STATEMENT
- What specific pain point or inefficiency are you solving?
- Who faces this problem daily? How severe is the pain?
- How are people coping with or working around this currently?

SLIDE 3: YOUR PROPOSED SOLUTION
- Describe your solution in simple, non-jargon terms.
- How does your solution solve the problem directly?
- What makes your solution 10x better than existing alternatives?

SLIDE 4: TARGET MARKET & USERS
- Who is your primary user/customer persona?
- Estimated size of this market (Campus, Nashik, Regional, National).
- User validation: Did you talk to potential users? What did they say?

SLIDE 5: BUSINESS DIRECTION & REVENUE MODEL
- How will this venture sustain itself or generate revenue?
- Who pays, and how much?
- Unit economics or key cost drivers (briefly).

SLIDE 6: CURRENT PROGRESS & ROADMAP
- What have you built or validated so far (Idea, Survey, Prototype, MVP)?
- Next 3-6 month milestones.
- What support or resources do you need from Sun Launchpad / Incubation?
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sun_Launchpad_2026_Pitch_Template.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const schoolIsOther = formData.school === 'Other';
  const domainIsOther = formData.domain === 'Other';
  const done = REQUIRED.filter((k) => String(formData[k]).trim().length > 1).length;
  const pct = Math.round((done / REQUIRED.length) * 100);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-20 sm:-top-24 -left-4 sm:-left-8 -right-4 sm:-right-8 bottom-0 -z-10 overflow-hidden">
        <div className="floating-orb w-[440px] h-[440px] bg-emerald-500/12 -top-24 -left-24" />
        <div className="floating-orb w-[360px] h-[360px] bg-gold-500/12 top-[40%] -right-24" />
        <div className="absolute inset-0 grid-pattern" />
      </div>

      <motion.section initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="pt-8 sm:pt-12 text-center max-w-2xl mx-auto space-y-4">
        <span className="section-badge"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sun Launchpad 2026 · 5-minute registration</span>
        <h1 className="section-title font-display text-4xl sm:text-6xl font-extrabold text-balance">
          Register your <span className="text-gradient-gold">idea.</span>
        </h1>
        <p className="section-subtitle text-sm sm:text-base">Get your verified Founder Pass. No registered company, no polished deck, no team required.</p>
      </motion.section>

      <div className="grid lg:grid-cols-12 gap-6 mt-10 items-start">
        {/* side panel */}
        <motion.aside initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="relative rounded-[22px] overflow-hidden spotlight text-white noise">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-gold-400 to-emerald-500 bg-[length:200%_100%] animate-gradient-x" />
            <div className="p-6 sm:p-7 space-y-5">
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-gold-300 uppercase">Your Progress</div>
                <div className="font-display text-3xl font-extrabold mt-1">{done}<span className="text-base opacity-50">/{REQUIRED.length}</span></div>
                <div className="h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
                  <motion.div className="h-full bg-gradient-gold rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>

              <div className="gold-rule opacity-60" />

              {/* Progressive Flow Indicator */}
              <div className="space-y-4">
                <div className={`flex gap-3.5 p-2 rounded-xl transition ${step === 1 ? 'bg-white/[0.06] border border-gold-500/30' : 'opacity-85'}`}>
                  <span className={`shrink-0 w-8 h-8 rounded-full font-display font-extrabold text-sm flex items-center justify-center ${step === 1 ? 'bg-gradient-gold text-[#1A1405]' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                    {step > 1 ? <i className="fa-solid fa-check text-xs" /> : '1'}
                  </span>
                  <div>
                    <div className="font-display font-bold text-sm">Contact Details</div>
                    <div className="text-xs text-cream-100/60 mt-0.5">Submit in 5 minutes with basic info.</div>
                  </div>
                </div>

                <div className={`flex gap-3.5 p-2 rounded-xl transition ${step === 2 ? 'bg-white/[0.06] border border-gold-500/30' : 'opacity-70'}`}>
                  <span className={`shrink-0 w-8 h-8 rounded-full font-display font-extrabold text-sm flex items-center justify-center ${step === 2 ? 'bg-gradient-gold text-[#1A1405]' : 'bg-white/10 text-white'}`}>
                    2
                  </span>
                  <div>
                    <div className="font-display font-bold text-sm">Your Idea</div>
                    <div className="text-xs text-cream-100/60 mt-0.5">Problem statement, solution &amp; sector.</div>
                  </div>
                </div>

                <div className="flex gap-3.5 p-2 rounded-xl opacity-60">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-white/10 text-white font-display font-extrabold text-sm flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <div className="font-display font-bold text-sm">Get Your Founder Pass</div>
                    <div className="text-xs text-cream-100/60 mt-0.5">Verified confirmation &amp; stage access.</div>
                  </div>
                </div>
              </div>

              <div className="gold-rule opacity-60" />

              <div className="flex flex-wrap gap-2 font-mono text-[10px] font-bold">
                {['100% equity kept', 'No fees', 'All schools welcome'].map((t) => (
                  <span key={t} className="px-2.5 py-1.5 rounded-full border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* form */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="lg:col-span-8">
          <Card hairline className="!p-6 sm:!p-9">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* STEP 1: CONTACT DETAILS */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }} className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-gradient-brand text-white font-display font-extrabold text-sm flex items-center justify-center border-glow">01</span>
                      <div>
                        <h2 className="font-display text-lg font-bold text-emerald-950 dark:text-white">Contact Details</h2>
                        <p className="text-xs opacity-60">Verification + pitch updates reach you here.</p>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-gold-600 dark:text-gold-300">Step 1 of 2</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Team leader name" req><input name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="e.g. Aarav Sharma" className="field" /></Field>
                    <Field label="Sandip PRN / Roll no." req><input name="prn" required value={formData.prn} onChange={handleChange} placeholder="e.g. 220101234001" className="field" /></Field>
                    <Field label="School / Institute" span>
                      <select name="school" value={formData.school} onChange={handleChange} className="field">
                        {sandipSchools.map((s) => <option key={s} value={s}>{s}</option>)}
                        <option value="Other">Other — not listed above</option>
                      </select>
                    </Field>
                    {schoolIsOther && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="sm:col-span-2">
                        <Field label="Your school / institute name" req span>
                          <input value={customSchool} onChange={(e) => setCustomSchool(e.target.value)} required={schoolIsOther} placeholder="e.g. School of Commerce & Management" className="field" />
                        </Field>
                      </motion.div>
                    )}
                    <Field label="Academic year"><select name="academicYear" value={formData.academicYear} onChange={handleChange} className="field">{academicYears.map((y) => <option key={y} value={y}>{y}</option>)}</select></Field>
                    <Field label="Gender"><select name="gender" value={formData.gender} onChange={handleChange} className="field"><option>Male</option><option>Female</option><option>Other / Prefer not to say</option></select></Field>
                    <Field label="Your email" req><input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="example@gmail.com" className="field" /></Field>
                    <Field label="WhatsApp number" req><input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="field" /></Field>
                  </div>

                  {step1Error && (
                    <p className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">{step1Error}</p>
                  )}

                  <div className="pt-2">
                    <Button type="button" variant="gold" onClick={handleProceedToIdea} className="w-full !py-4 shine-wrap">
                      Continue to Your Idea <i className="fa-solid fa-arrow-right text-xs" />
                    </Button>
                    <p className="text-center text-[11px] font-mono opacity-50 mt-2.5">Step 1 of 2: Contact details are verified before proceeding.</p>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: YOUR IDEA */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }} className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-gradient-gold text-[#1A1405] font-display font-extrabold text-sm flex items-center justify-center border-glow-gold">02</span>
                      <div>
                        <h2 className="font-display text-lg font-bold text-emerald-950 dark:text-white">Your Idea</h2>
                        <p className="text-xs opacity-60">Clarity beats polish. Rough is fine.</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setStep(1)} className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5">
                      <i className="fa-solid fa-chevron-left text-[10px]" /> Back to Contact Details
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Team Name */}
                    <Field label="Team name" req span>
                      <input name="ideaTitle" required value={formData.ideaTitle} onChange={handleChange} placeholder="e.g. Hostel food-waste tracker" className="field" />
                    </Field>

                    {/* Sector */}
                    <Field label="Sector" span>
                      <select name="domain" value={formData.domain} onChange={handleChange} className="field">
                        {domains.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {/* IMPORTANT: OTHER SECTOR BEHAVIOR */}
                      {domainIsOther && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-2.5">
                          <input
                            type="text"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            placeholder="Enter your sector"
                            required={domainIsOther}
                            className="field"
                          />
                        </motion.div>
                      )}
                    </Field>

                    {/* Team Size */}
                    <Field label="Team Size" span>
                      <div className="grid grid-cols-3 gap-2.5">
                        {teamOptions.map((o) => (
                          <button
                            key={o}
                            type="button"
                            onClick={() => set('teamType', o)}
                            className={`px-2 py-3 rounded-xl font-mono text-[11px] font-bold border transition ${
                              formData.teamType === o
                                ? 'bg-ink-950 text-cream-50 border-ink-950 dark:bg-gold-400 dark:text-[#1A1405] dark:border-gold-400 shadow-card dark:shadow-glow-gold day-pill-active'
                                : 'text-slate-500 dark:text-cream-100/75 opacity-80 hover:opacity-100 hover:text-emerald-950 dark:hover:text-white border-black/15 dark:border-white/15 lux-pill'
                            }`}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </Field>

                    {/* Problem Statement */}
                    <Field label="Problem Statement" req span>
                      <textarea
                        name="problemStatement"
                        required
                        rows={3}
                        value={formData.problemStatement}
                        onChange={handleChange}
                        placeholder="Who struggles, with what, and how painful is it?"
                        className="field resize-y leading-relaxed"
                      />
                    </Field>

                    {/* Proposed Solution */}
                    <Field label="Proposed Solution" req span>
                      <textarea
                        name="solutionOverview"
                        required
                        rows={3}
                        value={formData.solutionOverview}
                        onChange={handleChange}
                        placeholder="Your fix in plain words — plus where it could go."
                        className="field resize-y leading-relaxed"
                      />
                    </Field>

                    {/* PPT Template Access + Pitch Deck Upload */}
                    <Field label="Pitch Deck / Supporting Document (Optional)" span>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs opacity-60">Upload your deck or preview format</span>
                        <button
                          type="button"
                          onClick={() => setShowPptModal(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-gold-600 dark:text-gold-300 hover:text-gold-500 transition"
                        >
                          <i className="fa-solid fa-list-check text-xs" /> View Slide Outline
                        </button>
                      </div>

                      {/* Student Upload Field */}
                      <div className="border-2 border-dashed border-black/15 dark:border-emerald-500/25 rounded-2xl p-6 text-center hover:border-gold-500 transition relative bg-black/[0.02] dark:bg-white/[0.02]">
                        <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="space-y-1.5 pointer-events-none">
                          <i className="fa-solid fa-cloud-arrow-up text-xl text-gold-500" />
                          <p className="text-sm font-bold">{fileName ? `Attached: ${fileName}` : 'Drop your deck here, or click to browse'}</p>
                          <p className="text-[11px] font-mono opacity-50">PDF / PPTX · up to 15MB</p>
                        </div>
                      </div>

                      {/* Official SUN Launchpad Pitch Deck Access */}
                      <div className="mt-3 p-3.5 rounded-xl border border-gold-500/30 bg-gold-500/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-file-powerpoint text-sm" />
                          </span>
                          <div>
                            <div className="font-display font-bold text-xs text-emerald-950 dark:text-cream-50">Official SUN Launchpad Pitch Deck</div>
                            <div className="text-[11px] text-slate-500 dark:text-cream-100/60 font-sans">Read or review the official pitch deck before applying</div>
                          </div>
                        </div>
                        <a
                          href="/Sun_Launchpad_2026_Pitch_Deck_Template.pptx"
                          download="Sun_Launchpad_2026_Pitch_Deck_Template.pptx"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-mono text-[11px] font-bold bg-gradient-gold text-[#1A1405] hover:opacity-90 transition shrink-0 shadow-sm"
                        >
                          <i className="fa-solid fa-arrow-down-to-bracket text-xs" /> View Pitch Deck →
                        </a>
                      </div>
                    </Field>
                  </div>

                  <div className="pt-2 space-y-3">
                    {submitError && (
                      <p className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">{submitError}</p>
                    )}
                    <Button type="submit" variant="gold" className="w-full !py-4 shine-wrap" disabled={submitting}>
                      <i className="fa-solid fa-id-card" /> {submitting ? 'Registering…' : 'Register'}
                    </Button>
                    <p className="text-center text-[11px] font-mono opacity-50">Instant registration &amp; Founder Pass for Sun Launchpad 2026. No spam, only rounds.</p>
                  </div>
                </motion.div>
              )}
            </form>
          </Card>
        </motion.div>
      </div>

      {/* PPT Format & Template Modal */}
      <Modal isOpen={showPptModal} onClose={() => setShowPptModal(false)} title="Expected PPT Format / Template">
        <div className="space-y-4 py-1">
          <p className="text-xs text-cream-100/70">
            Follow this standard 6-slide structure for your pitch during Sun Launchpad 2026. Keep slides concise and clear.
          </p>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {[
              { num: 'Slide 1', title: 'Title & Team', desc: 'Venture Name, 1-line summary, Founder names, Sandip PRN, Department, Email & WhatsApp.' },
              { num: 'Slide 2', title: 'Problem Statement', desc: 'The exact friction or pain you are tackling. Who experiences it, and why current solutions fail.' },
              { num: 'Slide 3', title: 'Proposed Solution', desc: 'Your product or service concept in plain words. Key features and why it is 10x better.' },
              { num: 'Slide 4', title: 'Target Market & Users', desc: 'Customer persona, target market size, and any user feedback or survey quotes collected.' },
              { num: 'Slide 5', title: 'Business Direction', desc: 'How the venture generates revenue or sustains operations. Pricing model and core costs.' },
              { num: 'Slide 6', title: 'Current Progress & Roadmap', desc: 'Current status (Idea, Prototype, Demo), upcoming milestones, and what support you seek.' },
            ].map((s) => (
              <div key={s.num} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-gold-400 uppercase">{s.num}</span>
                  <span className="font-display font-bold text-sm text-cream-50">{s.title}</span>
                </div>
                <p className="text-xs text-cream-100/60 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <a
              href="/Sun_Launchpad_2026_Pitch_Deck_Template.pptx"
              download="Sun_Launchpad_2026_Pitch_Deck_Template.pptx"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-display text-xs font-bold bg-gradient-gold text-[#1A1405] hover:opacity-90 transition text-center w-full"
            >
              <i className="fa-solid fa-file-powerpoint mr-1" /> Download Official PPTX
            </a>
            <Button variant="secondary" onClick={handleDownloadPptTemplate} className="w-full !py-2.5 !text-xs">
              <i className="fa-solid fa-download mr-1" /> Outline (.txt)
            </Button>
            <Button variant="outline" onClick={() => setShowPptModal(false)} className="w-full sm:w-auto !py-2.5 !text-xs">
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
