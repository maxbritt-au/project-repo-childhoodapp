const userModel = require('../models/userModel');

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
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  userModel.create({ name, email, password, role }, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email already registered' });
      }
      console.error('Error inserting user:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ message: 'User created successfully' });
  });
};
