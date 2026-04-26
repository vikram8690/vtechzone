const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const { body, validationResult } = require('express-validator');
const { verifyToken, adminOnly } = require('../middleware/auth');

// POST /api/contact - submit contact form
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, message } = req.body;

  try {
    const pool = await getPool();
    await pool.request()
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .input('message', sql.NVarChar, message)
      .query('INSERT INTO messages (name, email, message) VALUES (@name, @email, @message)');

    res.status(201).json({ success: true, message: 'Message sent successfully! We will contact you soon.' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/messages - get all messages (admin only)
router.get('/messages', verifyToken, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT * FROM messages ORDER BY id DESC');
    res.json({ success: true, messages: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/messages/user - user's own messages
router.get('/messages/user', verifyToken, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.VarChar, req.user.email)
      .query('SELECT * FROM messages WHERE email = @email ORDER BY id DESC');
    res.json({ success: true, messages: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/messages/:id - admin delete message
router.delete('/messages/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM messages WHERE id = @id');
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
