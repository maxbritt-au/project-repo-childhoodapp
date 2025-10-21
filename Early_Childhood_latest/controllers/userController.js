const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

// =======================
// GET /api/users
// =======================
exports.getAllUsers = (req, res) => {
  userModel.getAll((err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Database Error');
    }
    res.json(rows);
  });
};

// =======================
// POST /api/login
// =======================
exports.loginUser = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  userModel.findByEmail(email, async (err, results) => {
    if (err) {
      console.error('Login query error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!results || !results.length) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    try {
      // Compare entered password with hashed password
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const sessionUser = {
        id: user.user_id || user.id || user.id_user,
        role: user.role,
        email: user.email,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      };

      req.session.regenerate((regenErr) => {
        if (regenErr) {
          console.error('Session regenerate error:', regenErr);
          return res.status(500).json({ message: 'Session error' });
        }

        req.session.user = sessionUser;

        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: 'Session error' });
          }

          return res.json({
            success: true,
            role: sessionUser.role,
            name: sessionUser.name,
          });
        });
      });
    } catch (err) {
      console.error('Password compare error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// =======================
// POST /api/users
// =======================
exports.createUser = async (req, res) => {
  const { role, name, email, password } = req.body || {};

  if (!role || !name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Hash password with salt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    userModel.create({ role, name, email, password: hashedPassword }, (err, results) => {
      if (err) {
        console.error('Create user error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.status(201).json({ success: true, user_id: results.insertId });
    });
  } catch (err) {
    console.error('Password hashing error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =======================
// POST /api/logout
// =======================
exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
};
