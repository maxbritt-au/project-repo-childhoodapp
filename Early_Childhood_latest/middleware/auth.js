// middleware/auth.js
function requireTeacher(req, res, next) {
  const role =
    req.session?.user?.role ||
    req.user?.role ||
    req.headers['x-user-role']; // dev fallback

  return role === 'teacher'
    ? next()
    : res.status(403).json({ error: 'Forbidden: teachers only' });
}

function requireLogin(req, res, next) {
  if (req.session?.user || req.user || req.headers['x-user-role']) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// IMPORTANT: use module.exports, not `exports = {...}`
module.exports = { requireTeacher, requireLogin };
