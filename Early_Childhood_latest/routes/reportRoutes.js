// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin } = require('../middleware/auth');

/* -------------------------------
   Helpers
-------------------------------- */
function toInt(val, fallback = 0) {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
}

/* ===============================
   POST /api/reports
   Body: { child_id, template_id, content }
   student_id comes from session
================================ */
router.post('/', requireLogin, (req, res) => {
  const child_id = Number(req.body?.child_id);
  const template_id = Number(req.body?.template_id);
  const content = req.body?.content;
  const student_id = req.session.user?.id;

  console.log('[REPORT_CREATE] payload:', {
    student_id,
    child_id,
    template_id,
    contentPreview: typeof content === 'string' ? content.slice(0, 100) : ''
  });

  if (!student_id) return res.status(401).json({ error: 'User not logged in' });
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

      // Friendlier messages for FK/NULL issues
      if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
        const msg = String(err.sqlMessage || '').toLowerCase();
        if (msg.includes('fk_reports_child')) {
          return res.status(400).json({ error: 'Invalid child_id (no matching child).' });
        }
        if (msg.includes('template')) {
          return res.status(400).json({ error: 'Invalid template_id (template not found).' });
        }
        if (msg.includes('student')) {
          return res.status(400).json({ error: 'Invalid student_id (session user not in users table).' });
        }
      }
      if (err.code === 'ER_TRUNCATED_WRONG_VALUE' || err.code === 'ER_BAD_NULL_ERROR') {
        return res.status(400).json({ error: 'Invalid field value(s).' });
      }

      return res.status(500).json({ error: 'Database error while creating report' });
    }
    res.status(201).json({ id: result.insertId });
  });
});

/* ===============================
   GET /api/reports
   Query: ?childId=3&limit=20&offset=0
   Returns reports about a specific child
================================ */
router.get('/', requireLogin, (req, res) => {
  const childId = Number(req.query.childId);
  if (!Number.isInteger(childId) || childId <= 0) {
    return res.status(400).json({ error: 'Invalid childId' });
  }

  const limit = Math.min(toInt(req.query.limit, 20), 50);
  const offset = Math.max(toInt(req.query.offset, 0), 0);

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
      console.error('[REPORT_LIST_CHILD] error:', err);
      return res.status(500).json({ error: 'Database error while fetching reports' });
    }
    res.json(rows);
  });
});

/* ===============================
   GET /api/reports/recent
   For dashboard sidebar (shape used by student-report page)
   Query: ?limit=8
================================ */
router.get('/recent', requireLogin, (req, res) => {
  const limit = Math.min(toInt(req.query.limit, 8), 50);

  const sql = `
    SELECT
      r.id,
      COALESCE(t.title, 'Report')             AS report_type,
      u.name                                  AS student_name,
      CONCAT(c.first_name, ' ', c.last_name)  AS child_name,
      r.submitted_at                          AS created_at
    FROM reports r
    JOIN users u     ON u.id = r.student_id
    JOIN children c  ON c.child_id = r.child_id
    LEFT JOIN templates t ON t.id = r.template_id
    ORDER BY r.submitted_at DESC
    LIMIT ?
  `;
  db.query(sql, [limit], (err, rows) => {
    if (err) {
      console.error('[REPORT_RECENT] error:', err);
      return res.status(500).json({ error: 'Database error fetching recent reports' });
    }
    res.json(rows);
  });
});

/* ===============================
   GET /api/reports/recent/my
   Most recent reports created by the logged-in student
================================ */
router.get('/recent/my', requireLogin, (req, res) => {
  const student_id = req.session.user?.id;
  if (!student_id) return res.status(401).json({ error: 'Not logged in' });

  const limit = Math.min(toInt(req.query.limit, 5), 20);

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
      console.error('[REPORT_RECENT_MY] error:', err);
      return res.status(500).json({ error: 'Database error fetching recent reports' });
    }
    res.json(rows);
  });
});

/* ===============================
   GET /api/reports/all?limit=50&offset=0
   Paginated full listing (used by Reports table)
================================ */
router.get('/all', requireLogin, (req, res) => {
  const limit = Math.min(toInt(req.query.limit, 50), 100);
  const offset = Math.max(toInt(req.query.offset, 0), 0);

  const sql = `
    SELECT 
      r.id,
      COALESCE(t.title, 'Report')             AS report_type,
      u.name                                  AS student_name,
      CONCAT(c.first_name, ' ', c.last_name)  AS child_name,
      r.submitted_at                          AS created_at
    FROM reports r
    JOIN users u     ON u.id = r.student_id
    JOIN children c  ON c.child_id = r.child_id
    LEFT JOIN templates t ON t.id = r.template_id
    ORDER BY r.submitted_at DESC
    LIMIT ? OFFSET ?
  `;
  db.query(sql, [limit, offset], (err, rows) => {
    if (err) {
      console.error('[REPORT_LIST_ALL] error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

/* ===============================
   DELETE /api/reports/:id
   Only the author OR a teacher/admin may delete
================================ */
router.delete('/:id', requireLogin, (req, res) => {
  const id = Number(req.params.id);
  const user = req.session.user;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid report ID' });
  }
  if (!user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Adjust role names to your app’s roles
  const canDeleteAny = ['admin', 'teacher'].includes(user.role);

  // Confirm the report exists and ownership
  const selectSql = 'SELECT id, student_id FROM reports WHERE id = ?';
  db.query(selectSql, [id], (err, rows) => {
    if (err) {
      console.error('[REPORT_DELETE] select error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!rows.length) return res.status(404).json({ error: 'Report not found' });

    const report = rows[0];
    const isOwner = report.student_id === user.id;
    if (!isOwner && !canDeleteAny) {
      return res.status(403).json({ error: 'Not authorized to delete this report' });
    }

    const delSql = 'DELETE FROM reports WHERE id = ?';
    db.query(delSql, [id], (err2) => {
      if (err2) {
        console.error('[REPORT_DELETE] delete error:', err2);
        // If FK constraints block deletion, consider ON DELETE CASCADE or soft-deletes
        return res.status(500).json({ error: 'Failed to delete report' });
      }
      return res.status(204).end(); // No Content
    });
  });
});

/* ===============================
   GET /api/reports/:id
   Keep this LAST so it doesn't shadow /recent, /all, etc.
================================ */
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
      console.error('[REPORT_GET] error:', err);
      return res.status(500).json({ error: 'Database error while fetching report' });
    }
    if (!rows.length) return res.status(404).json({ error: 'Report not found' });
    res.json(rows[0]);
  });
});

module.exports = router;
