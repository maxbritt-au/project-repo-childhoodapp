// controllers/userController.js
const userModel = require('../models/userModel');
const db = require('../config/db'); // Your MySQL connection

// GET /api/users
exports.getAllUsers = (req, res) => {
  userModel.getAll((err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Database Error');
    }
    res.json(rows);
  });
};

// POST /api/login
// Plain-text password check (matches your current schema), sets req.session.user
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

    if (!results || !results.length) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Plain-text comparison (you said no bcrypt yet)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Build the session payload your middleware expects
    const sessionUser = {
      id: user.user_id || user.id || user.id_user, // adapt to your column names
      role: user.role,                              // e.g., 'teacher' | 'parent' | 'admin'
      email: user.email,
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()
    };

    // Regenerate session ID to avoid fixation, then save user into session
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error('Session regenerate error:', regenErr);
        return res.status(500).json({ message: 'Session error' });
      }

      req.session.user = sessionUser;

      // Ensure session is persisted before responding
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ message: 'Session error' });
        }

        // Return minimal info to client
        return res.json({
          success: true,
          role: sessionUser.role,
          name: sessionUser.name
        });
      });
    });
  });
};

// POST /api/users
exports.createUser = (req, res) => {
  const { role, name, email, password } = req.body || {};
  if (!role || !name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  db.query(
    'INSERT INTO users (role, name, email, password) VALUES (?, ?, ?, ?)',
    [role, name, email, password],
    (err, results) => {
      if (err) {
        console.error('Create user error:', err);
        return res.json({ success: false, message: 'Error creating user' });
      }
      res.status(201).json({ success: true, user_id: results.insertId });
    }
  );
};

// (Optional) POST /api/logout
exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
};
