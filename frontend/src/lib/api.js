// Central API client. Base URL comes from frontend/.env (VITE_API_URL).
// Every public page uses try/catch around these and falls back to local content,
// so the site works fully even when the backend is offline.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || '/';
const TOKEN_KEY = 'sebc_admin_token';

export const apiBase = BASE;
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Absolute URL for uploaded photos (backend serves /uploads/...).
export const photoUrl = (u) => (!u ? '' : u.startsWith('/uploads/') ? `${BASE}${u}` : u);

async function req(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const t = token !== undefined ? token : getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // ---- auth ----
  login: (email, password) => req('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => req('/api/auth/me'),

  // ---- registrations ----
  createRegistration: (payload) => req('/api/registrations', { method: 'POST', body: payload }),
  listRegistrations: ({ search = '', status = '', page = 1, limit = 50 } = {}) =>
    req(`/api/registrations?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`),
  updateRegistration: (id, patch) => req(`/api/registrations/${id}`, { method: 'PATCH', body: patch }),
  deleteRegistration: (id) => req(`/api/registrations/${id}`, { method: 'DELETE' }),
  bulkStatus: (ids, status) => req('/api/registrations/bulk-status', { method: 'PATCH', body: { ids, status } }),
  bulkDelete: (ids) => req('/api/registrations/bulk-delete', { method: 'POST', body: { ids } }),
  importPreview: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${BASE}/api/registrations/import-preview`, {
      method: 'POST',
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Could not parse Excel file');
    return data;
  },
  importConfirm: (rows, mapping) => req('/api/registrations/import', { method: 'POST', body: { rows, mapping } }),
  exportSelected: async (ids) => {
    const t = getToken();
    const qs = ids && ids.length ? `?ids=${encodeURIComponent(ids.join(','))}` : '';
    const res = await fetch(`${BASE}/api/registrations/export${qs}`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ids && ids.length ? 'sebc-registrations-selected.csv' : 'sebc-registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
  exportRegistrations: async () => {
    const t = getToken();
    const res = await fetch(`${BASE}/api/registrations/export`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sebc-registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  },

  // ---- events ----
  eventsPublic: (status = '') => req(`/api/events${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  eventsAll: () => req('/api/events/all'),
  createEvent: (payload) => req('/api/events', { method: 'POST', body: payload }),
  updateEvent: (id, payload) => req(`/api/events/${id}`, { method: 'PUT', body: payload }),
  deleteEvent: (id) => req(`/api/events/${id}`, { method: 'DELETE' }),
  rsvp: (eventId, payload) => req(`/api/events/${eventId}/rsvp`, { method: 'POST', body: payload }),
  eventRsvps: (eventId) => req(`/api/events/${eventId}/rsvps`),

  // ---- team ----
  teamPublic: () => req('/api/team'),
  teamAll: () => req('/api/team/all'),
  createMember: (payload) => req('/api/team', { method: 'POST', body: payload }),
  updateMember: (id, payload) => req(`/api/team/${id}`, { method: 'PUT', body: payload }),
  deleteMember: (id) => req(`/api/team/${id}`, { method: 'DELETE' }),
  uploadPhoto: async (file) => {
    const fd = new FormData();
    fd.append('photo', file);
    const res = await fetch(`${BASE}/api/team/upload`, {
      method: 'POST',
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  // ---- sub-admins (super only) ----
  listAdmins: () => req('/api/admins'),
  createAdmin: (payload) => req('/api/admins', { method: 'POST', body: payload }),
  updateAdmin: (id, payload) => req(`/api/admins/${id}`, { method: 'PATCH', body: payload }),
  deleteAdmin: (id) => req(`/api/admins/${id}`, { method: 'DELETE' }),

  // ---- approval flow ----
  uploadDeck: async (file) => {
    const fd = new FormData();
    fd.append('deck', file);
    const res = await fetch(`${BASE}/api/registrations/upload-deck`, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Deck upload failed');
    return data;
  },
  acceptRegistration: (id) => req(`/api/registrations/${id}/accept`, { method: 'POST' }),
  resendPass: (id) => req(`/api/registrations/${id}/resend`, { method: 'POST' }),
  pendingTeam: () => req('/api/registrations/pending-team'),

  // ---- password setup / reset via email code ----
  forgotPassword: (email) => req('/api/auth/forgot', { method: 'POST', body: { email } }),
  resetPassword: ({ email, code, newPassword }) => req('/api/auth/reset', { method: 'POST', body: { email, code, newPassword } }),

  // ---- activity trail (super only) ----
  auditList: ({ actor = '', entity = '', action = '', page = 1, limit = 50 } = {}) =>
    req(`/api/audit?actor=${encodeURIComponent(actor)}&entity=${encodeURIComponent(entity)}&action=${encodeURIComponent(action)}&page=${page}&limit=${limit}`),

  // ---- QR #1: event check-in (public) ----
  checkin: (payload) => req('/api/checkin', { method: 'POST', body: payload }),
  checkinLookup: () => req('/api/checkin/lookup'),
  checkinStatus: () => req('/api/checkin/admin/status'),
  checkinTeams: () => req('/api/checkin/admin/teams'),
  checkinManual: (id) => req(`/api/checkin/admin/checkin/${id}`, { method: 'POST' }),
  checkinUndo: (id) => req(`/api/checkin/admin/undo/${id}`, { method: 'POST' }),
  checkinDeleteTeam: (id) => req(`/api/checkin/admin/teams/${id}`, { method: 'DELETE' }),
  checkinFixIndexes: () => req('/api/checkin/admin/fix-indexes', { method: 'POST' }),

  // ---- QR #2: peer feedback (public + admin) ----
  feedbackActive: () => req('/api/feedback/active'),
  feedbackVerify: (payload) => req('/api/feedback/verify', { method: 'POST', body: payload }),
  feedbackSubmit: (payload) => req('/api/feedback/submit', { method: 'POST', body: payload }),
  feedbackAdminStatus: () => req('/api/feedback/admin/status'),
  feedbackAdminStart: (teamNumber) => req('/api/feedback/admin/start', { method: 'POST', body: { teamNumber } }),
  feedbackAdminClose: () => req('/api/feedback/admin/close', { method: 'POST' }),
  feedbackAdminDeleteTeam: (teamNumber) => req(`/api/feedback/admin/by-team/${encodeURIComponent(teamNumber)}`, { method: 'DELETE' }),
  feedbackAdminDeleteAll: () => req('/api/feedback/admin/all', { method: 'DELETE' }),
  feedbackAdminResults: (sessionId = '') =>
    req(`/api/feedback/admin/results${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`),
  feedbackAdminResultsByTeam: (teamNumber) =>
    req(`/api/feedback/admin/results?teamNumber=${encodeURIComponent(teamNumber)}`),
  feedbackAdminHistory: () => req('/api/feedback/admin/results?history=1'),
  feedbackAdminExport: async (sessionId) => {
    const t = getToken();
    const res = await fetch(`${BASE}/api/feedback/admin/export?sessionId=${encodeURIComponent(sessionId)}`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-feedback-${sessionId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
  feedbackAdminExportByTeam: async (teamNumber) => {
    const t = getToken();
    const res = await fetch(`${BASE}/api/feedback/admin/export?teamNumber=${encodeURIComponent(teamNumber)}`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-${String(teamNumber).padStart(2, '0')}-feedback.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
  feedbackAdminExportAll: async () => {
    const t = getToken();
    const res = await fetch(`${BASE}/api/feedback/admin/export-all`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-teams-feedback.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};
