const db = require('../config/db');

// Get all users
exports.getAll = (callback) => {
  db.query('SELECT id, name, email, role FROM users', callback);
};

// Find user by email
exports.findByEmail = (email, callback) => {
  db.query(
    'SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1',
    [email],
    callback
  );
};

// Create new user
exports.create = (user, callback) => {
  const { name, email, password, role } = user;
  db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role],
    callback
  );
};
