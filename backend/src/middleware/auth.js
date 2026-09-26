const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

function getSecret() {
  if (!process.env.JWT_SECRET) console.warn('[auth] JWT_SECRET not set — using insecure dev fallback');
  return process.env.JWT_SECRET || 'dev-only-secret-change-me';
}

function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
}

// Verifies JWT and re-checks the sub-admin time window on EVERY request,
// so expiry kicks in mid-session without waiting for logout.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token. Please log in again.' });
  try {
    const decoded = jwt.verify(token, getSecret());
    if (decoded.role === 'super') {
      req.admin = { email: decoded.email, role: 'super' };
      req.adminRole = 'super';
      return next();
    }
    const user = await AdminUser.findById(decoded.sub);
    if (!user) return res.status(401).json({ error: 'Account not found' });
    const check = user.isAccessValid(new Date());
    if (!check.ok) return res.status(403).json({ error: check.reason });
    req.admin = user;
    req.adminRole = user.role;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

function requireSuper(req, res, next) {
  if (req.adminRole !== 'super') return res.status(403).json({ error: 'Super admin only' });
  next();
}

// Granular rights: requirePerm('events', 'manage'). Super bypasses everything.
function requirePerm(module, action) {
  return (req, res, next) => {
    if (req.adminRole === 'super') return next();
    const perms = (req.admin && req.admin.permissions && req.admin.permissions[module]) || {};
    if (perms[action]) return next();
    return res.status(403).json({ error: 'You do not have permission for this action' });
  };
}

module.exports = { signToken, requireAuth, requireSuper, requirePerm };
