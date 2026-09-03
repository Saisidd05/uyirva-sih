const { verifyToken } = require('../services/auth.service');

function authGuard(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return { ok: false, status: 401, body: { detail: 'Authentication required' } };
  try { return { ok: true, user: verifyToken(token) }; }
  catch { return { ok: false, status: 401, body: { detail: 'Invalid or expired token' } }; }
}

function roleGuard(role) {
  return user => user?.role === role
    ? { ok: true }
    : { ok: false, status: 403, body: { detail: `${role} access required` } };
}

module.exports = { authGuard, roleGuard };
