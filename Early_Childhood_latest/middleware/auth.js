// middleware/auth.js
function requireRoles(...allowed) {
  return (req, res, next) => {
    const role =
      req.session?.user?.role ||
      req.user?.role ||
      req.headers['x-user-role']; // dev fallback

    if (!role) return res.status(401).json({ error: 'Unauthorized' });

    const ok = allowed.map(r => r.toLowerCase()).includes(String(role).toLowerCase());
    return ok ? next() : res.status(403).json({ error: `Forbidden: requires one of [${allowed.join(', ')}]` });
  };
}

function requireLogin(req, res, next) {
  if (req.session?.user || req.user || req.headers['x-user-role']) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { requireRoles, requireLogin };
