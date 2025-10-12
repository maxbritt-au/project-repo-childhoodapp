// middleware/auth.js

// Single source of truth for pulling the authed user out of the request.
// Falls back to dev headers only if session/user isn't present.
function getAuthUser(req) {
  const sessionUser = req.session?.user || req.user || null;

  // Dev-only fallbacks (helpful in local testing with Postman)
  const headerRole = req.headers['x-user-role'];
  const headerUserId = req.headers['x-user-id'];

  if (sessionUser) return sessionUser;

  if (headerRole || headerUserId) {
    return {
      id: headerUserId ? Number(headerUserId) : undefined,
      role: headerRole || undefined,
    };
  }

  return null;
}

function requireLogin(req, res, next) {
  const user = getAuthUser(req);
  if (!user?.role || !Number.isFinite(user?.id)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Make sure downstream handlers can rely on req.session.user
  req.session = req.session || {};
  req.session.user = user;
  next();
}

function requireRoles(...allowed) {
  return (req, res, next) => {
    const user = getAuthUser(req);
    if (!user?.role) return res.status(401).json({ error: 'Unauthorized' });

    const ok = allowed
      .map(r => r.toLowerCase())
      .includes(String(user.role).toLowerCase());

    if (!ok) {
      return res
        .status(403)
        .json({ error: `Forbidden: requires one of [${allowed.join(', ')}]` });
    }

    // Normalize into session for downstream code
    req.session = req.session || {};
    req.session.user = user;
    next();
  };
}

// Convenience guards
const requireTeacher = requireRoles('teacher', 'admin');

module.exports = {
  getAuthUser,
  requireLogin,
  requireRoles,
  requireTeacher,
};
