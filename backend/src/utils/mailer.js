const nodemailer = require('nodemailer');

let transporter = null;
let cachedKey = null;

// Project convention is SMTP_USER / SMTP_PASS (see backend/.env.example).
// Accept SMTP_APP_PASSWORD as an alias for the password so Gmail App
// Passwords work under either name. Never hardcode secrets here.
function getSmtpPassword() {
  return process.env.SMTP_PASS || process.env.SMTP_APP_PASSWORD || '';
}

function isConfigured() {
  return !!(process.env.SMTP_USER && getSmtpPassword());
}

function getTransport() {
  if (!isConfigured()) return null;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = getSmtpPassword();
  // Recreate if credentials/host/port changed (e.g. env updated, tests).
  const key = `${host}:${port}:${user}:${pass.length}`;
  if (!transporter || cachedKey !== key) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      // Force IPv4: deployment envs (Vercel/Render) often cannot reach
      // Gmail's IPv6 address (ENETUNREACH 2607:f8b0:...:587).
      family: 4,
      auth: { user, pass },
    });
    cachedKey = key;
  }
  return transporter;
}

// For tests/diagnostics only — drops the cached transporter.
function _resetTransport() {
  transporter = null;
  cachedKey = null;
}

// Verifies the SMTP connection without exposing credentials.
// Throws on failure so callers can surface err.message as emailError.
async function verifyTransport() {
  const t = getTransport();
  if (!t) throw new Error('Email not configured (set SMTP_USER / SMTP_PASS in backend/.env)');
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
  });
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
// always works even before SMTP is set up.
// `sent` is only true when the SMTP server accepted the message.
async function sendApprovalEmail(reg) {
  const t = getTransport();
  if (!t) return { sent: false, error: 'Email not configured (set SMTP_USER / SMTP_PASS in backend/.env)' };
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  try {
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
    return { sent: false, error: err.message };
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
  const t = getTransport();
  if (!t) return { sent: false, error: 'Email not configured (set SMTP_USER / SMTP_PASS in backend/.env)' };
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  try {
    await t.verify();
    const info = await t.sendMail({
      from: `"SEBC • Sandip E-Club" <${from}>`,
      to: email,
      subject: 'You have SEBC admin access — set your password',
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#060B09;padding:32px 16px;color:#F4F1E6">
        <div style="max-width:560px;margin:0 auto">
          <p style="font-size:12px;letter-spacing:2px;color:#DDB84E;font-weight:bold;margin:0">SEBC × SUN LAUNCHPAD 2026</p>
          <h1 style="font-size:24px;margin:10px 0">You've been given admin access 🔑</h1>
          <p style="color:#B9C4BC;line-height:1.65;font-size:14px">Open the admin panel link below, choose <b style="color:#F4F1E6">Set / reset password</b>, and enter this one-time code with the email <b style="color:#F4F1E6">${esc(email)}</b>. The code works for 48 hours and only once.</p>
          ${btnRow(code)}
          <p style="text-align:center"><a href="${appLink('/#/admin?setup=1')}" style="display:inline-block;background:#DDB84E;color:#1A1405;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:999px;text-decoration:none">Open admin panel</a></p>
          <p style="font-size:12px;color:#8FA098">Your access may be limited to a time window chosen by the super admin — the panel shows it after login.</p>
        </div>
      </div>`,
    });
    if (info && Array.isArray(info.rejected) && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
      return { sent: false, error: `SMTP rejected recipient: ${info.rejected.join(', ')}` };
    }
    return { sent: true };
  } catch (err) {
    logSmtpError('mailer:invite', err);
    return { sent: false, error: err.message };
  }
}

// Forgot-password verification code (15 min, single use).
async function sendResetCodeEmail(email, code) {
  const t = getTransport();
  if (!t) return { sent: false, error: 'Email not configured (set SMTP_USER / SMTP_PASS in backend/.env)' };
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  try {
    await t.verify();
    const info = await t.sendMail({
      from: `"SEBC • Sandip E-Club" <${from}>`,
      to: email,
      subject: 'Your SEBC verification code',
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#060B09;padding:32px 16px;color:#F4F1E6">
        <div style="max-width:560px;margin:0 auto">
          <p style="font-size:12px;letter-spacing:2px;color:#DDB84E;font-weight:bold;margin:0">SEBC ADMIN ACCESS</p>
          <h1 style="font-size:24px;margin:10px 0">Verification code</h1>
          <p style="color:#B9C4BC;line-height:1.65;font-size:14px">Enter this code with a new password on the admin login screen. Valid 15 minutes, single use. If you didn't ask, ignore this email.</p>
          ${btnRow(code)}
        </div>
      </div>`,
    });
    if (info && Array.isArray(info.rejected) && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
      return { sent: false, error: `SMTP rejected recipient: ${info.rejected.join(', ')}` };
    }
    return { sent: true };
  } catch (err) {
    logSmtpError('mailer:reset', err);
    return { sent: false, error: err.message };
  }
}

// Pings the super admin (and permitted sub-admins) the moment an application lands.
async function sendNewRegistrationAlert(reg, extraRecipients = []) {
  const t = getTransport();
  if (!t) return { sent: false, error: 'Email not configured (set SMTP_USER / SMTP_PASS in backend/.env)' };
  const to = [String(process.env.SUPER_ADMIN_EMAIL || '').trim(), ...extraRecipients].filter(Boolean);
  if (!to.length) return { sent: false, error: 'No admin recipients configured' };
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  try {
    await t.verify();
    const info = await t.sendMail({
      from: `"SEBC • Sandip E-Club" <${from}>`,
      to: to.join(', '),
      subject: `New application: ${reg.ideaTitle} — ${reg.fullName}`,
      html: `
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
      </div>`,
    });
    if (info && Array.isArray(info.rejected) && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
      return { sent: false, error: `SMTP rejected recipient: ${info.rejected.join(', ')}` };
    }
    return { sent: true };
  } catch (err) {
    logSmtpError('mailer:alert', err);
    return { sent: false, error: err.message };
  }
}
