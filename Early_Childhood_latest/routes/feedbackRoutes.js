const express = require('express');
const router = express.Router();
const db = require('../config/db');

// helper
const q = (sql, params) => db.promise().query(sql, params);

// POST /api/feedbacks
router.post('/', async (req, res) => {
  try {
    const { report_id, title, description } = req.body;

    if (!report_id || !description) {
      return res.status(400).json({ error: 'report_id and description are required' });
    }

    // ⬇️ get teacher id from session (preferred), then fallback to body
    const teacherId =
      (req.session?.user && (req.session.user.id || req.session.user.userId)) ??
      req.session?.userId ??
      req.body.teacher_id ??  // last resort (not trusted)
      null;

    if (!teacherId) {
      return res.status(401).json({ error: 'Not logged in as a teacher (teacher_id missing)' });
    }

    // Insert with title (retry without title if column missing)
    try {
      const [result] = await q(
        `INSERT INTO feedbacks (report_id, teacher_id, title, comment, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [Number(report_id), Number(teacherId), title || null, description]
      );
      return res.status(201).json({
        id: result.insertId,
        report_id: Number(report_id),
        teacher_id: Number(teacherId),
        title: title || null,
        comment: description
      });
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        // table doesn't have `title` (safety fallback)
        const [result] = await q(
          `INSERT INTO feedbacks (report_id, teacher_id, comment, created_at)
           VALUES (?, ?, ?, NOW())`,
          [Number(report_id), Number(teacherId), description]
        );
        return res.status(201).json({
          id: result.insertId,
          report_id: Number(report_id),
          teacher_id: Number(teacherId),
          title: null,
          comment: description
        });
      }
      console.error('Insert error:', err);
      return res.status(500).json({ error: err.sqlMessage || err.message || 'Insert failed' });
    }
  } catch (outer) {
    console.error('Route error:', outer);
    res.status(500).json({ error: outer.message || 'Failed to submit feedback' });
  }
});

// GET /api/feedbacks?reportId=#
router.get('/', async (req, res) => {
  try {
    const { reportId } = req.query;
    if (!reportId) return res.status(400).json({ error: 'reportId query param is required' });
    const [rows] = await q(
      `SELECT id, report_id, teacher_id, title, comment, created_at
         FROM feedbacks
        WHERE report_id = ?
        ORDER BY created_at DESC`,
      [Number(reportId)]
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.sqlMessage || err.message || 'Failed to fetch feedback' });
  }
});

module.exports = router;
