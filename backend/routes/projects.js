const express = require('express');
const router  = express.Router();
const { query } = require('../db');
const { body, validationResult } = require('express-validator');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM projects ORDER BY id DESC');
    res.json({ success: true, projects: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.post('/', verifyToken, adminOnly, [
  body('title').trim().notEmpty(),
  body('technology').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { title, technology, description } = req.body;
  try {
    await query('INSERT INTO projects (title, technology, description) VALUES (?, ?, ?)', [title, technology, description]);
    res.status(201).json({ success: true, message: 'Project added.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  const { title, technology, description } = req.body;
  try {
    await query('UPDATE projects SET title=?, technology=?, description=? WHERE id=?', [title, technology, description, req.params.id]);
    res.json({ success: true, message: 'Project updated.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await query('DELETE FROM projects WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
