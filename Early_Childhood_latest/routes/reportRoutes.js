// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// ===============================
// POST /api/reports
// Body: { student_id, child_id, template_id, content }
// ===============================
router.post('/', requireLogin, (req, res) => {
  const { student_id, child_id, template_id, content } = req.body || {};
  if (!student_id || !child_id || !template_id || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO reports (student_id, child_id, template_id, content)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [student_id, child_id, template_id, content], (err, result) => {
    if (err) {
      console.error('Create report error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ id: result.insertId });
  });
});

// ===============================
// GET /api/reports?childId=3
// Returns all reports about a child
// ===============================
router.get('/', requireLogin, (req, res) => {
  const childId = Number(req.query.childId);
  if (!Number.isInteger(childId) || childId <= 0) {
    return res.status(400).json({ error: 'Invalid childId' });
  }

  const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
  const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);

  const sql = `
    SELECT r.id, r.student_id, u.name AS student_name,
           r.child_id, c.first_name, c.last_name,
           r.template_id, t.title AS template_title,
           r.content, r.submitted_at
    FROM reports r
    JOIN users u ON u.id = r.student_id
    JOIN children c ON c.child_id = r.child_id
    LEFT JOIN templates t ON r.template_id = t.id
    WHERE r.child_id = ?
    ORDER BY r.submitted_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [childId, limit, offset], (err, rows) => {
    if (err) {
      console.error('List reports error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

module.exports = router;
