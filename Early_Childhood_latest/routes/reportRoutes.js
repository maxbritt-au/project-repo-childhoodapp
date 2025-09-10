// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// ===============================
// POST /api/reports
// Body: { child_id, template_id, content }
// student_id comes from session
// ===============================
router.post('/', requireLogin, (req, res) => {
  const child_id = Number(req.body?.child_id);
  const template_id = Number(req.body?.template_id);
  const content = req.body?.content;
  const student_id = req.session.user?.id;

  // Helpful logging
  console.log('[REPORT_CREATE] payload:', {
    student_id,
    child_id,
    template_id,
    contentPreview: typeof content === 'string' ? content.slice(0, 100) : ''
  });

  if (!student_id) {
    return res.status(401).json({ error: 'User not logged in' });
  }
  if (!Number.isInteger(child_id) || !Number.isInteger(template_id) || !content) {
    return res.status(400).json({ error: 'Missing required fields: child_id, template_id, content' });
  }

  const sql = `
    INSERT INTO reports (student_id, child_id, template_id, content)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [student_id, child_id, template_id, content], (err, result) => {
    if (err) {
      console.error('[REPORT_CREATE] DB error:', err);

      // Friendly messages for FK errors
      if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
        const msg = String(err.sqlMessage || '').toLowerCase();
        if (msg.includes('fk_reports_child')) {
          return res.status(400).json({ error: 'Invalid child_id (no matching child in database).' });
        }
        if (msg.includes('reports_ibfk_2') || msg.includes('template')) {
          return res.status(400).json({ error: 'Invalid template_id (template not found).' });
        }
        if (msg.includes('reports_ibfk_1') || msg.includes('student')) {
          return res.status(400).json({ error: 'Invalid student_id (session user not in users table).' });
        }
      }

      // NULL / invalid value
      if (err.code === 'ER_TRUNCATED_WRONG_VALUE' || err.code === 'ER_BAD_NULL_ERROR') {
        return res.status(400).json({ error: 'Invalid field value(s).' });
      }

      return res.status(500).json({ error: 'Database error while creating report' });
    }
    res.status(201).json({ id: result.insertId });
  });
});

// ===============================
// GET /api/reports?childId=3&limit=20&offset=0
// Returns reports about a child
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
      return res.status(500).json({ error: 'Database error while fetching reports' });
    }
    res.json(rows);
  });
});

// ===============================
// GET /api/reports/:id
// Returns a single report by ID
// ===============================
router.get('/:id', requireLogin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid report ID' });
  }

  const sql = `
    SELECT r.id, r.student_id, u.name AS student_name,
           r.child_id, c.first_name, c.last_name,
           r.template_id, t.title AS template_title,
           r.content, r.submitted_at
    FROM reports r
    JOIN users u ON u.id = r.student_id
    JOIN children c ON c.child_id = r.child_id
    LEFT JOIN templates t ON r.template_id = t.id
    WHERE r.id = ?
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('Get report error:', err);
      return res.status(500).json({ error: 'Database error while fetching report' });
    }
    if (!rows.length) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(rows[0]);
  });
});

// ===============================
// GET /api/reports/recent/my?limit=5
// Returns the most recent reports created by the logged-in student
// ===============================
router.get('/recent/my', requireLogin, (req, res) => {
  const student_id = req.session.user?.id;
  if (!student_id) return res.status(401).json({ error: 'Not logged in' });

  const limit = Math.min(parseInt(req.query.limit || '5', 10), 20);

  const sql = `
    SELECT
      r.id,
      r.child_id,
      r.submitted_at,
      t.title AS template_title,
      c.first_name AS child_first_name,
      c.last_name  AS child_last_name
    FROM reports r
    LEFT JOIN templates t ON t.id = r.template_id
    LEFT JOIN children  c ON c.child_id = r.child_id
    WHERE r.student_id = ?
    ORDER BY r.submitted_at DESC
    LIMIT ?
  `;

  db.query(sql, [student_id, limit], (err, rows) => {
    if (err) {
      console.error('Recent reports error:', err);
      return res.status(500).json({ error: 'Database error fetching recent reports' });
    }
    res.json(rows);
  });
});

module.exports = router;
