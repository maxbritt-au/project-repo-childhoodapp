// models/userModel.js
// mysql2 callback API + per-query timeout + logs so we can see where it stalls

const db = require('../config/db');

// one place to run queries with timeout and guaranteed callback
function q(sql, params, cb) {
  const t0 = Date.now();
  db.query({ sql, timeout: 8000 }, params, (err, rows) => {
    const took = Date.now() - t0;
    if (err) {
      console.error('[DB]', sql.split('\n')[0], 'ERR after', took, 'ms =>', err.code || err.message);
      return cb(err);
    }
    console.log('[DB]', sql.split('\n')[0], 'OK in', took, 'ms');
    cb(null, rows || []);
  });
}

exports.getAll = (cb) => {
  q('SELECT id, name, email, role FROM users ORDER BY id DESC LIMIT 200', [], cb);
};

exports.findByEmail = (email, cb) => {
  const e = String(email || '').toLowerCase().trim();
  if (!e) return cb(null, []);
  q('SELECT id, name, email, role, password FROM users WHERE email = ? LIMIT 1', [e], cb);
};

exports.create = ({ role, name, email, password }, cb) => {
  q('INSERT INTO users (role, name, email, password) VALUES (?, ?, ?, ?)',
    [role, name, String(email || '').toLowerCase().trim(), password], cb);
};
