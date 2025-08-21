// routes/childrenRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // <- your mysql2 callback connection

function isValidGender(g) {
  return ['Male', 'Female', 'Other'].includes(g);
}

// POST /api/children  -> add child
router.post('/', (req, res) => {
  const { first_name, last_name, dob, gender } = req.body || {};
  if (!first_name || !last_name || !dob || !gender) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!isValidGender(gender)) {
    return res.status(400).json({ error: 'Invalid gender' });
  }

  const sql = 'INSERT INTO children (first_name, last_name, dob, gender) VALUES (?, ?, ?, ?)';
  db.query(sql, [first_name.trim(), last_name.trim(), dob, gender], (err, result) => {
    if (err) {
      console.error('Add child error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, child_id: result.insertId });
  });
});

// GET /api/children -> list children
router.get('/', (_req, res) => {
  db.query('SELECT * FROM children ORDER BY child_id DESC', (err, rows) => {
    if (err) {
      console.error('List children error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

module.exports = router; // *********** IMPORTANT ***********
