/* ============================================================
   vTechZone — Unique Visitor Tracker
   - Generates a persistent visitor_id in localStorage
   - Tracks each real visitor ONCE (dedup handled server-side)
   - Exposes helpers to capture name/email on user consent
   ============================================================ */
(function () {
  'use strict';

  const VID_KEY = 'vtechzone_vid';

  /* ── Generate or retrieve persistent visitor ID ── */
  function getOrCreateId() {
    let id = localStorage.getItem(VID_KEY);
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'vt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  }

  /* ── Fire-and-forget: track this visit ── */
  function trackVisit(vid) {
    fetch('/api/visitors/track', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ visitor_id: vid, user_agent: navigator.userAgent }),
    }).catch(() => {});
  }

  /* ── Public: returns current visitor_id ── */
  window.vtechGetVisitorId = function () {
    return localStorage.getItem(VID_KEY) || '';
  };

  /* ── Public: called after user voluntarily provides name/email ──
     Triggered on: signup, login, contact form, enquiry form       */
  window.vtechUpdateVisitorInfo = function (name, email) {
    const vid = localStorage.getItem(VID_KEY);
    if (!vid || (!name && !email)) return;
    fetch('/api/visitors/update-info', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ visitor_id: vid, name: name || '', email: email || '' }),
    }).catch(() => {});
  };

  /* ── Run on page load ── */
  const vid = getOrCreateId();
  trackVisit(vid);

})();
