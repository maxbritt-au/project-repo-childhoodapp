const db = require('../config/db');


exports.getAll = (callback) => {
  db.query('SELECT id, name, email, role FROM users', callback);
};


exports.findByEmail = (email, callback) => {
  db.query('SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1', [email], callback);
};

exports.create = (user, callback) => {
  const { name, email, password, role } = user;
  db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role], callback);
};
