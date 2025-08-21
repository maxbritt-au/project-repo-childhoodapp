// routes/childrenRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // <-- your mysql2 (callbacks) connection
const { requireLogin, requireTeacher } = require('../middleware/auth');

// ---- helpers ----
const ALLOWED_GENDERS = ['Male', 'Female', 'Other'];
function isValidGender(g) {
  return ALLOWED_GENDERS.includes(g);
}
function nonEmpty(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

// ================================
// GET /api/children
// - Everyone logged-in can view
// - Optional query params: q, gender, sort, limit, offset
//   sort: last_asc | last_desc | age_asc | age_desc
// ================================
router.get('/', requireLogin, (req, res) => {
  const { q = '', gender = '', sort = 'last_asc' } = req.query;

  // pagination (optional)
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 200);
  const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);

  const where = [];
  const params = [];

  if (nonEmpty(q)) {
    where.push('(first_name LIKE ? OR last_name LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (nonEmpty(gender) && isValidGender(gender)) {
    where.push('gender = ?');
    params.push(gender);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Sort handling
  // age = derived from dob; for SQL we can sort by dob (older = smaller dob)
  let orderSql = 'ORDER BY last_name ASC, first_name ASC';
  if (sort === 'last_desc') orderSql = 'ORDER BY last_name DESC, first_name DESC';
  else if (sort === 'age_desc') orderSql = 'ORDER BY dob ASC';   // oldest first
  else if (sort === 'age_asc') orderSql = 'ORDER BY dob DESC';   // youngest first

  const sql = `
    SELECT child_id, first_name, last_name, dob, gender
    FROM children
    ${whereSql}
    ${orderSql}
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [...params, limit, offset], (err, rows) => {
    if (err) {
      console.error('List children error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    return res.json(rows);
  });
});

// ================================
// GET /api/children/:id
// - Everyone logged-in can view
// ================================
router.get('/:id', requireLogin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid child id' });
  }

  const sql = `
    SELECT child_id, first_name, last_name, dob, gender
    FROM children
    WHERE child_id = ?
    LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('Get child error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!rows.length) return res.status(404).json({ error: 'Child not found' });
    return res.json(rows[0]);
  });
});

// ================================
// POST /api/children
// - Teachers only (create)
// Body: { first_name, last_name, dob, gender }
// ================================
router.post('/', requireTeacher, (req, res) => {
  const { first_name, last_name, dob, gender } = req.body || {};

  if (!nonEmpty(first_name) || !nonEmpty(last_name) || !nonEmpty(dob) || !nonEmpty(gender)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!isValidGender(gender)) {
    return res.status(400).json({ error: 'Invalid gender' });
  }

  const sql = `
    INSERT INTO children (first_name, last_name, dob, gender)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [first_name.trim(), last_name.trim(), dob, gender], (err, result) => {
    if (err) {
      console.error('Add child error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    return res.status(201).json({ success: true, child_id: result.insertId });
  });
});

// ================================
// PUT /api/children/:id
// - Teachers only (update)
// Body: any subset of { first_name, last_name, dob, gender }
// ================================
router.put('/:id', requireTeacher, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid child id' });
  }

  const { first_name, last_name, dob, gender } = req.body || {};
  const sets = [];
  const params = [];

  if (nonEmpty(first_name)) { sets.push('first_name = ?'); params.push(first_name.trim()); }
  if (nonEmpty(last_name))  { sets.push('last_name = ?');  params.push(last_name.trim()); }
  if (nonEmpty(dob))        { sets.push('dob = ?');        params.push(dob); }
  if (nonEmpty(gender)) {
    if (!isValidGender(gender)) return res.status(400).json({ error: 'Invalid gender' });
    sets.push('gender = ?'); params.push(gender);
  }

  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });

  const sql = `UPDATE children SET ${sets.join(', ')} WHERE child_id = ?`;
  db.query(sql, [...params, id], (err, result) => {
    if (err) {
      console.error('Update child error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Child not found' });
    return res.json({ success: true });
  });
});

// ================================
// DELETE /api/children/:id
// - Teachers only (delete)
// ================================
router.delete('/:id', requireTeacher, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid child id' });
  }

  db.query('DELETE FROM children WHERE child_id = ?', [id], (err, result) => {
    if (err) {
      console.error('Delete child error:', err);
      // likely foreign key constraint (e.g., reports) — surface a friendly message
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: 'Cannot delete: child has related records' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Child not found' });
    return res.json({ success: true });
  });
});

module.exports = router;
