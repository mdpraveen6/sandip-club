const EMAIL_RE = /^\S+@\S+\.\S+$/;

function isEmail(v) {
  return typeof v === 'string' && EMAIL_RE.test(v.trim());
}

// Returns an array of missing-field messages; empty = valid.
function required(body, fields) {
  const missing = [];
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || String(body[f]).trim() === '') {
      missing.push(`${f} is required`);
    }
  }
  return missing;
}

module.exports = { isEmail, required };
