const express = require('express');
const router  = express.Router();
const { query } = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, role FROM users ORDER BY id DESC');
    res.json({ success: true, users: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.put('/:id/role', verifyToken, adminOnly, async (req, res) => {
  const { role } = req.body;
  if (!['admin','user'].includes(role))
    return res.status(400).json({ success: false, message: 'Invalid role.' });
  try {
    await query('UPDATE users SET role=? WHERE id=?', [role, req.params.id]);
    res.json({ success: true, message: 'Role updated.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
