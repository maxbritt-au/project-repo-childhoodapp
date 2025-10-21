// controllers/userController.js
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

// GET /api/users
exports.getAllUsers = (req, res) => {
  userModel.getAll((err, rows) => {
    if (err) {
      console.error('[USERS] fetch error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(rows);
  });
};

// POST /api/login
exports.loginUser = (req, res) => {
  const t0 = Date.now();
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  console.log('[LOGIN] attempt', { email });

  // Defensive: local 10s safety timer so request can NEVER hang
  let done = false;
  const safety = setTimeout(() => {
    if (done) return;
    done = true;
    console.error('[LOGIN] timed out waiting on model/bcrypt');
    return res.status(504).json({ message: 'Login timed out' });
  }, 10000);

  userModel.findByEmail(email, async (err, results) => {
    if (done) return;
    if (err) {
      clearTimeout(safety);
      done = true;
      console.error('[LOGIN] query error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!results || !results.length) {
      clearTimeout(safety);
      done = true;
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        clearTimeout(safety);
        done = true;
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const sessionUser = {
        id: user.id || user.user_id || user.id_user,
        role: user.role,
        email: user.email,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      };

      req.session.regenerate((regenErr) => {
        if (done) return;
        if (regenErr) {
          clearTimeout(safety);
          done = true;
          console.error('[LOGIN] session regenerate error:', regenErr);
          return res.status(500).json({ message: 'Session error' });
        }

        req.session.user = sessionUser;

        // Saving is optional with MemoryStore, but keep it explicit
        req.session.save((saveErr) => {
          if (done) return;
          clearTimeout(safety);
          done = true;

          if (saveErr) {
            console.error('[LOGIN] session save error:', saveErr);
            return res.status(500).json({ message: 'Session error' });
          }

          console.log('[LOGIN] success', {
            id: sessionUser.id,
            role: sessionUser.role,
            tookMs: Date.now() - t0,
          });

          return res.json({
            success: true,
            role: sessionUser.role,
            name: sessionUser.name,
            userId: sessionUser.id,
            email: sessionUser.email,
          });
        });
      });
    } catch (cmpErr) {
      if (!done) {
        clearTimeout(safety);
        done = true;
        console.error('[LOGIN] bcrypt compare error:', cmpErr);
        return res.status(500).json({ message: 'Server error' });
      }
    }
  });
};

// POST /api/users
exports.createUser = async (req, res) => {
  const { role, name, email, password } = req.body || {};

  if (!role || !name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    userModel.create({ role, name, email, password: hashedPassword }, (err, results) => {
      if (err) {
        console.error('[SIGNUP] create error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.status(201).json({ success: true, user_id: results.insertId });
    });
  } catch (hashErr) {
    console.error('[SIGNUP] hash error:', hashErr);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/logout
exports.logoutUser = (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
};
