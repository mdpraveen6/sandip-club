import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
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
    teamType: 'Solo Founder',
    pitchDeckUrl: '',
  });
  const [fileName, setFileName] = useState('');
  const [customSchool, setCustomSchool] = useState('');
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
  const domains = ['Artificial Intelligence & SaaS', 'Healthcare & BioTech', 'AgriTech & Rural Innovation', 'FinTech & Blockchain', 'CleanTech & Renewable Energy', 'EdTech & Social Impact', 'Hardware, Robotics & IoT', 'Consumer / E-Commerce'];
  const teamOptions = ['Solo Founder', '2 Co-Founders', '3-4 Team Members'];

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');
    const resolvedSchool = formData.school === 'Other' ? customSchool.trim() : formData.school;
    let deckUrl = '';
    if (deckFile) {
      try {
        const up = await api.uploadDeck(deckFile);
        deckUrl = up.url || '';
      } catch {
        deckUrl = '';
      }
    }
    const payload = { ...formData, school: resolvedSchool, pitchDeckUrl: deckUrl };
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

  const schoolIsOther = formData.school === 'Other';
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
        <span className="section-badge"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 2026 cohort · 5-minute form</span>
        <h1 className="section-title font-display text-4xl sm:text-6xl font-extrabold text-balance">
          Register your <span className="text-gradient-gold">idea.</span>
        </h1>
        <p className="section-subtitle text-sm sm:text-base">Get your verified Founder Pass instantly. No company, no deck, no team required.</p>
      </motion.section>

      <div className="grid lg:grid-cols-12 gap-6 mt-10 items-start">
        {/* side panel */}
        <motion.aside initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="relative rounded-[22px] overflow-hidden spotlight text-white noise">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-gold-400 to-emerald-500 bg-[length:200%_100%] animate-gradient-x" />
            <div className="p-6 sm:p-7 space-y-5">
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-gold-300">YOUR PROGRESS</div>
                <div className="font-display text-3xl font-extrabold mt-1">{done}<span className="text-base opacity-50">/{REQUIRED.length}</span></div>
                <div className="h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
                  <motion.div className="h-full bg-gradient-gold rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>
              <div className="gold-rule opacity-60" />
              <div className="space-y-4">
                {[
                  { t: 'Submit in 5 minutes', d: 'Seven short fields. Rough drafts welcome.' },
                  { t: 'Get your Founder Pass', d: 'Instant verification + reference ID.' },
                  { t: 'Walk into Round 1 ready', d: 'Pitch slot, mentor desk and sprint access.' },
                ].map((s, i) => (
                  <div key={s.t} className="flex gap-3.5">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-gradient-gold text-[#1A1405] font-display font-extrabold text-sm flex items-center justify-center">{i + 1}</span>
                    <div><div className="font-display font-bold text-sm">{s.t}</div><div className="text-xs text-cream-100/60 mt-0.5">{s.d}</div></div>
                  </div>
                ))}
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
            <form onSubmit={handleSubmit} className="space-y-9">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-brand text-white font-display font-extrabold text-sm flex items-center justify-center border-glow">01</span>
                  <div><h2 className="font-display text-lg font-bold text-emerald-950 dark:text-white">Who you are</h2><p className="text-xs opacity-60">Verification + pitch updates reach you here.</p></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Full name" req><input name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="e.g. Aarav Sharma" className="field" /></Field>
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
                  <Field label="Sandip email" req><input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@sandipuniversity.edu.in" className="field" /></Field>
                  <Field label="WhatsApp number" req><input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="field" /></Field>
                </div>
              </div>

              <div className="gold-rule opacity-50" />

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-gold text-[#1A1405] font-display font-extrabold text-sm flex items-center justify-center border-glow-gold">02</span>
                  <div><h2 className="font-display text-lg font-bold text-emerald-950 dark:text-white">Your idea</h2><p className="text-xs opacity-60">Clarity beats polish. Rough is fine.</p></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Startup / Idea title" req><input name="ideaTitle" required value={formData.ideaTitle} onChange={handleChange} placeholder="e.g. Hostel food-waste tracker" className="field" /></Field>
                  <Field label="Sector / Domain"><select name="domain" value={formData.domain} onChange={handleChange} className="field">{domains.map((d) => <option key={d} value={d}>{d}</option>)}</select></Field>
                  <Field label="Team setup" span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {teamOptions.map((o) => (
                        <button key={o} type="button" onClick={() => set('teamType', o)}
                          className={`px-2 py-3 rounded-xl font-mono text-[11px] font-bold border transition ${formData.teamType === o ? 'bg-ink-950 text-cream-50 border-ink-950 dark:bg-gold-400 dark:text-[#1A1405] dark:border-gold-400 shadow-card dark:shadow-glow-gold day-pill-active' : 'text-slate-500 dark:text-cream-100/75 opacity-80 hover:opacity-100 hover:text-emerald-950 dark:hover:text-white border-black/15 dark:border-white/15 lux-pill'}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Problem statement" req span><textarea name="problemStatement" required rows={3} value={formData.problemStatement} onChange={handleChange} placeholder="Who struggles, with what, and how painful is it?" className="field resize-y leading-relaxed" /></Field>
                  <Field label="Proposed solution & vision" req span><textarea name="solutionOverview" required rows={3} value={formData.solutionOverview} onChange={handleChange} placeholder="Your fix in plain words — plus where it could go." className="field resize-y leading-relaxed" /></Field>
                  <Field label="Pitch deck / proposal (optional)" span>
                    <div className="border-2 border-dashed border-black/15 dark:border-emerald-500/25 rounded-2xl p-6 text-center hover:border-gold-500 transition relative bg-black/[0.02] dark:bg-white/[0.02]">
                      <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="space-y-1.5 pointer-events-none">
                        <i className="fa-solid fa-cloud-arrow-up text-xl text-gold-500" />
                        <p className="text-sm font-bold">{fileName ? `Attached: ${fileName}` : 'Drop your deck here, or click to browse'}</p>
                        <p className="text-[11px] font-mono opacity-50">PDF / PPTX · up to 15MB</p>
                      </div>
                    </div>
                  </Field>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                {submitError && (
                  <p className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">{submitError}</p>
                )}
                <Button type="submit" variant="gold" className="w-full !py-4 shine-wrap" disabled={submitting}>
                  <i className="fa-solid fa-id-card" /> {submitting ? 'Submitting…' : 'Submit application for review'}
                </Button>
                <p className="text-center text-[11px] font-mono opacity-50">Admin review → approval email with your Founder Pass. No spam, only rounds.</p>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
