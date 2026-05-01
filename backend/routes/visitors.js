const express = require('express');
const router  = express.Router();
const { query } = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');

/* ──────────────────────────────────────────────────────────────
   POST /api/visitors/track
   Called on every page load. Inserts a new visitor or updates
   last_visit + visit_count for a returning visitor.
   Uniqueness is guaranteed by the visitor_id UNIQUE index.
────────────────────────────────────────────────────────────── */
router.post('/track', async (req, res) => {
  const { visitor_id, user_agent } = req.body;

  if (!visitor_id || typeof visitor_id !== 'string' || visitor_id.length > 255) {
    return res.status(400).json({ success: false, message: 'Invalid visitor_id' });
  }

  const ip = ((req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim()).slice(0, 100);
  const ua = (user_agent || req.headers['user-agent'] || '').slice(0, 500);

  try {
    await query(
      `INSERT INTO visitors (visitor_id, user_agent, ip_address)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         last_visit  = NOW(),
         visit_count = visit_count + 1`,
      [visitor_id, ua, ip]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('[TRACK VISITOR]', e.message);
    res.status(500).json({ success: false });
  }
});

/* ──────────────────────────────────────────────────────────────
   POST /api/visitors/update-info
   Called after user voluntarily provides name/email
   (signup, login, contact form). Updates the visitor record.
────────────────────────────────────────────────────────────── */
router.post('/update-info', async (req, res) => {
  const { visitor_id, name, email } = req.body;

  if (!visitor_id || typeof visitor_id !== 'string') {
    return res.status(400).json({ success: false, message: 'visitor_id required' });
  }

  const safeName  = (name  || '').trim().slice(0, 100)  || null;
  const safeEmail = (email || '').trim().slice(0, 150)  || null;

  if (safeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  try {
    if (safeName && safeEmail) {
      await query(
        'UPDATE visitors SET name = ?, email = ? WHERE visitor_id = ?',
        [safeName, safeEmail, visitor_id]
      );
    } else if (safeName) {
      await query(
        'UPDATE visitors SET name = ? WHERE visitor_id = ?',
        [safeName, visitor_id]
      );
    } else if (safeEmail) {
      await query(
        'UPDATE visitors SET email = ? WHERE visitor_id = ?',
        [safeEmail, visitor_id]
      );
    }
    res.json({ success: true });
  } catch (e) {
    console.error('[UPDATE VISITOR INFO]', e.message);
    res.status(500).json({ success: false });
  }
});

/* ──────────────────────────────────────────────────────────────
   GET /api/visitors/stats  (admin only)
   Returns unique visitor counts and a recent visitors list.
────────────────────────────────────────────────────────────── */
router.get('/stats', verifyToken, adminOnly, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalRes, todayRes, emailRes, recentRes] = await Promise.all([
      query('SELECT COUNT(*) AS cnt FROM visitors'),
      query('SELECT COUNT(*) AS cnt FROM visitors WHERE first_visit >= ?', [todayStart]),
      query("SELECT COUNT(*) AS cnt FROM visitors WHERE email IS NOT NULL AND email != ''"),
      query(
        `SELECT name, email, first_visit, last_visit, visit_count
         FROM visitors
         ORDER BY last_visit DESC
         LIMIT 50`
      )
    ]);

    res.json({
      success:         true,
      total_unique:    Number(totalRes.recordset[0]?.cnt || 0),
      today_unique:    Number(todayRes.recordset[0]?.cnt || 0),
      with_email:      Number(emailRes.recordset[0]?.cnt || 0),
      recent_visitors: recentRes.recordset || []
    });
  } catch (e) {
    console.error('[VISITOR STATS]', e.message);
    res.status(500).json({ success: false, message: 'Failed to load visitor stats' });
  }
});

module.exports = router;
