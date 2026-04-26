const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { getPool, sql } = require('../db');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'vtechzone_super_secret_key_2024';

// ─── POST /api/auth/signup ────────────────────────────────────────────────
router.post('/signup', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    const pool = await getPool();

    const existing = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id FROM users WHERE email = @email');

    if (existing.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 12);

    await pool.request()
      .input('name',     sql.VarChar, name)
      .input('email',    sql.VarChar, email)
      .input('password', sql.VarChar, hashed)
      .input('role',     sql.VarChar, 'user')
      .query('INSERT INTO users (name, email, password, role) VALUES (@name, @email, @password, @role)');

    res.status(201).json({ success: true, message: 'Account created successfully! Please login.' });

  } catch (err) {
    console.error('[SIGNUP ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;

  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id, name, email, password, role FROM users WHERE email = @email');

    // ── User not found ──
    if (result.recordset.length === 0) {
      console.log('[LOGIN] No user found for email:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.recordset[0];

    // ── Password field missing / null in DB ──
    if (!user.password) {
      console.error('[LOGIN] Password field is empty in DB for:', email);
      return res.status(500).json({ success: false, message: 'Account setup incomplete. Run fix-admin-password.js.' });
    }

    // ── Compare password ──
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('[LOGIN] Wrong password for:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // ── Issue JWT ──
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[LOGIN] Success:', email, '| role:', user.role);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err.message, err.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, name, email, role FROM users WHERE id = @id');

    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, user: result.recordset[0] });
  } catch (err) {
    console.error('[ME ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
