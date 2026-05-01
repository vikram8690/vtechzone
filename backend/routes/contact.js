const express = require('express');
const router  = express.Router();
const { query } = require('../db');
const { body, validationResult } = require('express-validator');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message too short')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, message } = req.body;
  try {
    await query('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)', [name, email, message]);

    // Link visitor record if visitor_id provided
    const vid = (req.body.visitor_id || '').trim().slice(0, 255);
    if (vid) {
      query(
        "UPDATE visitors SET name=?, email=? WHERE visitor_id=? AND (email IS NULL OR email='')",
        [name, email, vid]
      ).catch(() => {});
    }

    res.status(201).json({ success: true, message: 'Message sent successfully! We will contact you soon.' });
  } catch (err) {
    console.error('[CONTACT ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

router.get('/messages', verifyToken, adminOnly, async (req, res) => {
  try {
    const result = await query('SELECT * FROM messages ORDER BY id DESC');
    res.json({ success: true, messages: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.get('/messages/user', verifyToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM messages WHERE email = ? ORDER BY id DESC', [req.user.email]);
    res.json({ success: true, messages: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.delete('/messages/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
