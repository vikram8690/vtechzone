const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const { body, validationResult } = require('express-validator');
const { verifyToken, adminOnly } = require('../middleware/auth');

// GET /api/projects - public
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM projects ORDER BY id DESC');
    res.json({ success: true, projects: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM projects WHERE id = @id');
    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, project: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/projects - admin only
router.post('/', verifyToken, adminOnly, [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('technology').trim().notEmpty().withMessage('Technology required'),
  body('description').trim().notEmpty().withMessage('Description required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { title, technology, description } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('title', sql.VarChar, title)
      .input('technology', sql.VarChar, technology)
      .input('description', sql.NVarChar, description)
      .query('INSERT INTO projects (title, technology, description) VALUES (@title, @technology, @description)');
    res.status(201).json({ success: true, message: 'Project added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/projects/:id - admin only
router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  const { title, technology, description } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('title', sql.VarChar, title)
      .input('technology', sql.VarChar, technology)
      .input('description', sql.NVarChar, description)
      .query('UPDATE projects SET title=@title, technology=@technology, description=@description WHERE id=@id');
    res.json({ success: true, message: 'Project updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/projects/:id - admin only
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM projects WHERE id = @id');
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
