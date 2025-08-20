const userModel = require('../models/userModel');
const db = require("../config/db"); // Your MySQL connection

exports.getAllUsers = (req, res) => {
  userModel.getAll((err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Database Error');
    }
    res.json(rows);
  });
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  userModel.findByEmail(email, (err, results) => {
    if (err) {
      console.error('Login query error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!results.length || results[0].password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    res.json({ role: user.role, name: user.name });
  });
};

exports.createUser = (req, res) => {
  const { role, name, email, password } = req.body;
  // Add validation as needed
  db.query(
    'INSERT INTO users (role, name, email, password) VALUES (?, ?, ?, ?)',
    [role, name, email, password],
    (err, results) => {
      if (err) return res.json({ success: false, message: 'Error creating user' });
      res.json({ success: true });
    }
  );
};
