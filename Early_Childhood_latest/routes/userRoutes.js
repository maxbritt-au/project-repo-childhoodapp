// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireLogin } = require('../middleware/auth');

// ==============================
// User Management Routes
// ==============================

// Get all users
router.get('/users', userController.getAllUsers);

// Register a new user
router.post('/users', userController.createUser);

// Login
router.post('/login', userController.loginUser);

// Logout
router.post('/logout', userController.logoutUser);

// ==============================
// Session / Current User Routes
// ==============================

// Get current logged-in user (from session)
router.get('/me', requireLogin, (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Only send safe fields (avoid sending password hashes)
  const { id, name, role, email } = req.session.user;
  res.json({ id, name, role, email });
});

module.exports = router;
