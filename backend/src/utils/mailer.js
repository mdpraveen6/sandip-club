const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const net = require('net');

let transporter = null;
let cachedKey = null;
let cachedIp = null;
let cachedIpExpires = 0;
const IP_TTL_MS = 5 * 60 * 1000; // re-resolve Gmail's A records every 5 min
// Last SMTP target attempted (literal IP + port + hostname). Surfaced in
// errors/logs for diagnosis — Gmail IPs are public, never credentials.
let lastTarget = null;
// Which channel the last attempt used ('smtp' | 'resend' | null).
let lastChannel = null;

// Project convention is SMTP_USER / SMTP_PASS (see backend/.env.example).
// Accept SMTP_APP_PASSWORD as an alias for the password so Gmail App
// Passwords work under either name. Never hardcode secrets here.
function getSmtpPassword() {
  return process.env.SMTP_PASS || process.env.SMTP_APP_PASSWORD || '';
}

function isConfigured() {
  return !!((process.env.RESEND_API_KEY || '').trim()
    || (process.env.SMTP_USER && getSmtpPassword()));
}

// HTTPS email API (Resend) — used when RESEND_API_KEY is set. Works over
// port 443 even on hosts whose firewall drops outbound SMTP (some Render
// hosts time out on smtp.gmail.com:587). SMTP/IPv4 below is the fallback.
function useResend() {
  return !!(process.env.RESEND_API_KEY || '').trim();
}

function resendFrom() {
  const base = process.env.MAIL_FROM || process.env.SMTP_USER || 'onboarding@resend.dev';
  // Resend validates the addr-spec; keep an ASCII display name.
  const m = String(base).match(/<([^<>]+)>\s*$/);
  const addr = (m ? m[1] : String(base)).trim();
  return `SEBC Sandip E-Club <${addr}>`;
}

function normalizeTo(to) {
  const list = (Array.isArray(to) ? to : String(to || '').split(','))
    .map((s) => String(s).trim())
    .filter(Boolean);
  return list;
}

function resendTimeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  return undefined;
}

// Sends one email via Resend HTTPS API. Resolves only on HTTP 2xx (+ id).
// Throws otherwise so callers surface the message as emailError. Never logs
// the API key.
async function sendViaResend({ to, subject, html }) {
  const key = (process.env.RESEND_API_KEY || '').trim();
  if (!key) throw new Error('Email not configured (set RESEND_API_KEY in backend/.env)');
  const recipients = normalizeTo(to);
  if (!recipients.length) throw new Error('No email recipients');
  lastChannel = 'resend';
  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: resendFrom(), to: recipients, subject, html }),
      signal: resendTimeoutSignal(30000),
    });
  } catch (err) {
    throw new Error(`Resend request failed: ${err.message}`);
  }
  let data = {};
  try { data = await res.json(); } catch { /* non-JSON body */ }
  if (!res.ok) {
    const detail = (data && (data.message || data.error)) || `Resend error (${res.status})`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  return data;
}

// NOTE: nodemailer v10 ignores a `family` transport option — its internal
// resolver always merges IPv4+IPv6 and picks randomly, which is exactly what
// produced `ENETUNREACH 2607:f8b0:...:587`. So we resolve the SMTP hostname
// to IPv4 OURSELVES and hand nodemailer a literal IPv4 address (its resolver
// short-circuits for IPs). `tls.servername` keeps SNI/cert verification
// pinned to the real hostname.
async function resolveSmtpIPv4(host) {
  const now = Date.now();
  if (cachedIp && cachedIpExpires > now) return cachedIp;
  const found = await dns.lookup(host, { family: 4, all: true });
  if (!found || !found.length) throw new Error(`No IPv4 address found for ${host}`);
  cachedIp = found[Math.floor(Math.random() * found.length)].address;
  cachedIpExpires = now + IP_TTL_MS;
  return cachedIp;
}

async function getTransport() {
  if (!isConfigured()) return null;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = getSmtpPassword();
  // Literal IPv4 — IPv6 is never attempted, so ENETUNREACH on 2607:f8b0::/32
  // cannot happen regardless of nodemailer's internal resolver behaviour.
  const ipv4 = await resolveSmtpIPv4(host);
  if (!net.isIPv4(ipv4)) throw new Error(`Resolved SMTP address is not IPv4: ${ipv4}`);
  lastTarget = { ip: ipv4, port, hostname: host };
  lastChannel = 'smtp';
  // Recreate if endpoint/credentials changed (env update, DNS rotation, tests).
  const key = `${ipv4}:${port}:${user}:${pass.length}`;
  if (!transporter || cachedKey !== key) {
    transporter = nodemailer.createTransport({
      host: ipv4,
      port,
      secure: port === 465,
      family: 4,
      tls: { servername: host },
      auth: { user, pass },
    });
    cachedKey = key;
  }
  return transporter;
}

// For tests/diagnostics only — drops the cached transporter + DNS entry.
function _resetTransport() {
  transporter = null;
  cachedKey = null;
  cachedIp = null;
  cachedIpExpires = 0;
  lastTarget = null;
  lastChannel = null;
}

// Verifies the email channel without exposing credentials.
// Resend mode: validates the API key via GET /domains (no email sent).
// SMTP mode: verifies the SMTP connection.
// Throws on failure so callers can surface err.message as emailError.
async function verifyTransport() {
  if (useResend()) {
    const key = (process.env.RESEND_API_KEY || '').trim();
    let res;
    try {
      res = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${key}` },
        signal: resendTimeoutSignal(30000),
      });
    } catch (err) {
      throw new Error(`Resend request failed: ${err.message}`);
    }
    if (!res.ok) throw new Error(`Resend key check failed (${res.status})`);
    return true;
  }
  const t = await getTransport();
  if (!t) throw new Error('Email not configured (set RESEND_API_KEY or SMTP_USER / SMTP_PASS in backend/.env)');
  await t.verify();
  return true;
}

// Log useful network/SMTP diagnostics. Never log user/pass.
function logSmtpError(tag, err) {
  if (!err) return;
  console.error(`[${tag}]`, {
    message: err.message,
    code: err.code,
    command: err.command,
    responseCode: err.responseCode,
    syscall: err.syscall,
    address: err.address,
    port: err.port,
    target: lastTarget,
  });
}

// Appends the attempted SMTP target to an error message so the API response
// shows WHICH address failed (e.g. IPv4 literal vs IPv6). Only call when a
// transport was actually built (lastTarget set); never includes credentials.
function withTarget(err) {
  const msg = err && err.message ? err.message : String(err);
  if (lastChannel === 'smtp' && lastTarget && !/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|2607:|::/.test(msg)) {
    return `${msg} [smtp ${lastTarget.ip}:${lastTarget.port}]`;
  }
  return msg;
}

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function passHtml(reg) {
  const issued = reg.acceptedAt ? new Date(reg.acceptedAt) : new Date();
  const dateStr = issued
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
  const row = (k, v, big) => `
    <p style="margin:10px 0 2px;font-size:11px;letter-spacing:1.5px;color:#8FA098">${k}</p>
    <p style="margin:0;font-size:${big ? '22px' : '16px'};font-weight:bold;color:${big ? '#DDB84E' : '#F4F1E6'}">${v}</p>`;
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#060B09;padding:32px 16px;color:#F4F1E6">
    <div style="max-width:560px;margin:0 auto">
      <p style="font-size:12px;letter-spacing:2px;color:#DDB84E;font-weight:bold;margin:0">SEBC × SUN LAUNCHPAD 2026</p>
      <h1 style="font-size:26px;margin:10px 0">You're approved, ${esc(reg.fullName)} 🎉</h1>
      <p style="color:#B9C4BC;line-height:1.65;font-size:14px">Your idea <b style="color:#F4F1E6">“${esc(reg.ideaTitle)}”</b> cleared admin review. Your verified Founder Pass is below — <b>screenshot, save or print this email</b> and bring it to Round 1 reporting.</p>
      <div style="border:1px solid #C9A227;border-radius:16px;overflow:hidden;margin:22px 0">
        <div style="height:6px;background:linear-gradient(90deg,#10B981,#DDB84E,#10B981)"></div>
        <div style="padding:20px 22px">
          <div style="font-size:11px;letter-spacing:2px;color:#DDB84E;font-weight:bold">SEBC FOUNDER PASS ● VERIFIED</div>
          ${row('FOUNDER', esc(reg.fullName))}
          ${row('VENTURE', esc(reg.ideaTitle))}
          ${row('SCHOOL', esc(reg.school || '—'))}
          ${row('REF ID', esc(reg.passRef), true)}
          ${row('ISSUED', esc(dateStr))}
        </div>
      </div>
      <p style="color:#B9C4BC;line-height:1.65;font-size:14px;margin:0 0 6px"><b style="color:#F4F1E6">What's next:</b></p>
      <ol style="color:#B9C4BC;line-height:1.7;font-size:14px;margin:0;padding-left:20px">
        <li>Round 1 reporting details arrive on your WhatsApp + email.</li>
        <li>Meet your mentor desk and refine the 60-second pitch.</li>
        <li>Show this pass at the venue for entry.</li>
      </ol>
      <p style="font-size:12px;color:#8FA098;margin-top:20px">— Team SEBC, Sandip University Nashik</p>
    </div>
  </div>`;
}

// Sends the approval email with the Founder Pass.
// Never throws for missing config — returns { sent, error? } so accepting
// always works even before email is set up.
// `sent` is only true when the provider accepted the message.
async function sendApprovalEmail(reg) {
  try {
    if (useResend()) {
      await sendViaResend({
        to: reg.email,
        subject: `Approved — your SUN Launchpad Founder Pass (${reg.passRef})`,
        html: passHtml(reg),
      });
      return { sent: true };
    }
    const t = await getTransport();
    if (!t) return { sent: false, error: 'Email not configured (set RESEND_API_KEY or SMTP_USER / SMTP_PASS in backend/.env)' };
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    await t.verify();
    const info = await t.sendMail({
      from: `"SEBC • Sandip E-Club" <${from}>`,
      to: reg.email,
      subject: `Approved — your SUN Launchpad Founder Pass (${reg.passRef})`,
      html: passHtml(reg),
    });
    if (info && Array.isArray(info.rejected) && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
      return { sent: false, error: `SMTP rejected recipient: ${info.rejected.join(', ')}` };
    }
    return { sent: true };
  } catch (err) {
    logSmtpError('mailer', err);
    return { sent: false, error: withTarget(err) };
  }
}

module.exports = { isConfigured, getTransport, verifyTransport, _resetTransport, sendApprovalEmail, sendAccessInviteEmail, sendResetCodeEmail, sendNewRegistrationAlert };

function appLink(path) {
  const base = String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${base}${path}`;
}

const btnRow = (code) => `
  <div style="font-size:30px;font-weight:bold;letter-spacing:8px;color:#1A1405;background:linear-gradient(135deg,#F3E2A9,#DDB84E);border-radius:12px;padding:14px 10px;text-align:center;margin:16px 0">${code}</div>`;

// Invite email: sub-admin sets their OWN password via code (super never handles passwords).
async function sendAccessInviteEmail(email, code) {
  const inviteHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#060B09;padding:32px 16px;color:#F4F1E6">
        <div style="max-width:560px;margin:0 auto">
          <p style="font-size:12px;letter-spacing:2px;color:#DDB84E;font-weight:bold;margin:0">SEBC × SUN LAUNCHPAD 2026</p>
          <h1 style="font-size:24px;margin:10px 0">You've been given admin access 🔑</h1>
          <p style="color:#B9C4BC;line-height:1.65;font-size:14px">Open the admin panel link below, choose <b style="color:#F4F1E6">Set / reset password</b>, and enter this one-time code with the email <b style="color:#F4F1E6">${esc(email)}</b>. The code works for 48 hours and only once.</p>
          ${btnRow(code)}
          <p style="text-align:center"><a href="${appLink('/#/admin?setup=1')}" style="display:inline-block;background:#DDB84E;color:#1A1405;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:999px;text-decoration:none">Open admin panel</a></p>
          <p style="font-size:12px;color:#8FA098">Your access may be limited to a time window chosen by the super admin — the panel shows it after login.</p>
        </div>
      </div>`;
  try {
    if (useResend()) {
      await sendViaResend({
        to: email,
        subject: 'You have SEBC admin access — set your password',
        html: inviteHtml,
      });
      return { sent: true };
    }
    const t = await getTransport();
    if (!t) return { sent: false, error: 'Email not configured (set RESEND_API_KEY or SMTP_USER / SMTP_PASS in backend/.env)' };
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    await t.verify();
    const info = await t.sendMail({
      from: `"SEBC • Sandip E-Club" <${from}>`,
      to: email,
      subject: 'You have SEBC admin access — set your password',
      html: inviteHtml,
    });
    if (info && Array.isArray(info.rejected) && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
      return { sent: false, error: `SMTP rejected recipient: ${info.rejected.join(', ')}` };
    }
    return { sent: true };
  } catch (err) {
    logSmtpError('mailer:invite', err);
    return { sent: false, error: withTarget(err) };
  }
}

// Forgot-password verification code (15 min, single use).
async function sendResetCodeEmail(email, code) {
  const resetHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#060B09;padding:32px 16px;color:#F4F1E6">
        <div style="max-width:560px;margin:0 auto">
          <p style="font-size:12px;letter-spacing:2px;color:#DDB84E;font-weight:bold;margin:0">SEBC ADMIN ACCESS</p>
          <h1 style="font-size:24px;margin:10px 0">Verification code</h1>
          <p style="color:#B9C4BC;line-height:1.65;font-size:14px">Enter this code with a new password on the admin login screen. Valid 15 minutes, single use. If you didn't ask, ignore this email.</p>
          ${btnRow(code)}
        </div>
      </div>`;
  try {
    if (useResend()) {
      await sendViaResend({
        to: email,
        subject: 'Your SEBC verification code',
        html: resetHtml,
      });
      return { sent: true };
    }
    const t = await getTransport();
    if (!t) return { sent: false, error: 'Email not configured (set RESEND_API_KEY or SMTP_USER / SMTP_PASS in backend/.env)' };
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    await t.verify();
    const info = await t.sendMail({
      from: `"SEBC • Sandip E-Club" <${from}>`,
      to: email,
      subject: 'Your SEBC verification code',
      html: resetHtml,
    });
    if (info && Array.isArray(info.rejected) && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
      return { sent: false, error: `SMTP rejected recipient: ${info.rejected.join(', ')}` };
    }
    return { sent: true };
  } catch (err) {
    logSmtpError('mailer:reset', err);
    return { sent: false, error: withTarget(err) };
  }
}

// Pings the super admin (and permitted sub-admins) the moment an application lands.
async function sendNewRegistrationAlert(reg, extraRecipients = []) {
  const to = [String(process.env.SUPER_ADMIN_EMAIL || '').trim(), ...extraRecipients].filter(Boolean);
  if (!to.length) return { sent: false, error: 'No admin recipients configured' };
  const alertHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#060B09;padding:32px 16px;color:#F4F1E6">
        <div style="max-width:560px;margin:0 auto">
          <p style="font-size:12px;letter-spacing:2px;color:#DDB84E;font-weight:bold;margin:0">NEW REGISTRATION</p>
          <h1 style="font-size:22px;margin:10px 0">${esc(reg.ideaTitle)}</h1>
          <div style="border:1px solid rgba(201,162,39,.4);border-radius:12px;padding:16px 18px;font-size:14px;line-height:1.8;color:#B9C4BC">
            <div><b style="color:#F4F1E6">${esc(reg.fullName)}</b> · ${esc(reg.prn)}</div>
            <div>${esc(reg.email)} · ${esc(reg.phone)}</div>
            <div>${esc(reg.school)} · ${esc(reg.academicYear)} · ${esc(reg.teamType)}</div>
            <div>Sector: ${esc(reg.domain || '—')}</div>
          </div>
          <p style="color:#B9C4BC;font-size:14px"><b style="color:#F4F1E6">Problem:</b> ${esc((reg.problemStatement || '').slice(0, 300))}</p>
          <p style="text-align:center;margin-top:20px"><a href="${appLink('/#/admin')}" style="display:inline-block;background:#DDB84E;color:#1A1405;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:999px;text-decoration:none">Review in admin panel</a></p>
        </div>
      </div>`;
  try {
    if (useResend()) {
      await sendViaResend({
        to,
        subject: `New application: ${reg.ideaTitle} — ${reg.fullName}`,
        html: alertHtml,
      });
      return { sent: true };
    }
    const t = await getTransport();
    if (!t) return { sent: false, error: 'Email not configured (set RESEND_API_KEY or SMTP_USER / SMTP_PASS in backend/.env)' };
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    await t.verify();
    const info = await t.sendMail({
      from: `"SEBC • Sandip E-Club" <${from}>`,
      to: to.join(', '),
      subject: `New application: ${reg.ideaTitle} — ${reg.fullName}`,
      html: alertHtml,
    });
    if (info && Array.isArray(info.rejected) && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
      return { sent: false, error: `SMTP rejected recipient: ${info.rejected.join(', ')}` };
    }
    return { sent: true };
  } catch (err) {
    logSmtpError('mailer:alert', err);
    return { sent: false, error: withTarget(err) };
  }
}
