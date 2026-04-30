const express  = require('express');
const router   = express.Router();
const { query } = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');

// GET /api/analytics/stats  — admin only
router.get('/stats', verifyToken, adminOnly, async (req, res) => {
  try {
    const now            = new Date();
    const todayStart     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart      = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 6);
    const thirtyAgo      = new Date(todayStart); thirtyAgo.setDate(thirtyAgo.getDate() - 29);

    const [totalRes, recentRes, topPagesRes] = await Promise.all([
      query('SELECT COUNT(*) AS cnt FROM page_visits'),
      query('SELECT page, ip_hash, created_at FROM page_visits WHERE created_at >= ? ORDER BY created_at DESC', [thirtyAgo]),
      query('SELECT page, COUNT(*) AS cnt FROM page_visits GROUP BY page ORDER BY cnt DESC')
    ]);

    const total  = Number(totalRes.recordset[0]?.cnt || 0);
    const visits = recentRes.recordset;

    const countBetween = (from, to) =>
      visits.filter(v => { const d = new Date(v.created_at); return d >= from && d < to; }).length;

    const today     = countBetween(todayStart, now);
    const yesterday = countBetween(yesterdayStart, todayStart);
    const thisWeek  = countBetween(weekStart, now);
    const thisMonth = visits.length;

    // Last 7 days chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart); dayStart.setDate(dayStart.getDate() - i);
      const dayEnd   = new Date(dayStart);   dayEnd.setDate(dayEnd.getDate() + 1);
      last7Days.push({
        date:  dayStart.toISOString().slice(0, 10),
        label: dayStart.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        count: countBetween(dayStart, dayEnd)
      });
    }

    // Unique IPs today
    const uniqueToday = new Set(
      visits
        .filter(v => new Date(v.created_at) >= todayStart && v.ip_hash)
        .map(v => v.ip_hash)
    ).size;

    const topPages = topPagesRes.recordset.slice(0, 8).map(p => ({
      page:  p.page,
      count: Number(p.cnt)
    }));

    res.json({
      success: true,
      stats: { total, today, yesterday, thisWeek, thisMonth, uniqueToday },
      last7Days,
      topPages
    });
  } catch (e) {
    console.error('Analytics error:', e);
    res.status(500).json({ success: false, message: 'Failed to load analytics' });
  }
});

module.exports = router;
