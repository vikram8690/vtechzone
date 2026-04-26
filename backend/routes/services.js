const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const { body, validationResult } = require('express-validator');
const { verifyToken, adminOnly } = require('../middleware/auth');

// GET /api/services - get all services (public)
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM services ORDER BY id ASC');
    res.json({ success: true, services: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/services/:id - get single service
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM services WHERE id = @id');
    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, service: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/services - add service (admin only)
router.post('/', verifyToken, adminOnly, [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').trim().notEmpty().withMessage('Description required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { title, description, image } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('title', sql.VarChar, title)
      .input('description', sql.NVarChar, description)
      .input('image', sql.VarChar, image || '')
      .query('INSERT INTO services (title, description, image) VALUES (@title, @description, @image)');
    res.status(201).json({ success: true, message: 'Service added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/services/:id - update service (admin only)
router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  const { title, description, image } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('title', sql.VarChar, title)
      .input('description', sql.NVarChar, description)
      .input('image', sql.VarChar, image || '')
      .query('UPDATE services SET title=@title, description=@description, image=@image WHERE id=@id');
    res.json({ success: true, message: 'Service updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/services/:id - delete service (admin only)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM services WHERE id = @id');
    res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
