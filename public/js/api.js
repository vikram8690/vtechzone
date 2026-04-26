/* =============================================
   vTechZone – Shared API / Auth Helpers
   Used by: all public HTML pages
   ============================================= */

const API_BASE = 'https://vtechzone.in/api';

/* ---------- token / user ---------- */
function getToken() { return localStorage.getItem('vtechzone_token'); }

function getUser() {
  try { return JSON.parse(localStorage.getItem('vtechzone_user')); }
  catch { return null; }
}

function saveAuth(token, user) {
  localStorage.setItem('vtechzone_token', token);
  localStorage.setItem('vtechzone_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('vtechzone_token');
  localStorage.removeItem('vtechzone_user');
}

/* ---------- role checks ---------- */
function isLoggedIn() { return !!getToken(); }
function isAdmin()    { const u = getUser(); return u && u.role === 'admin'; }

/* ---------- core fetch ---------- */
async function apiRequest(endpoint, method = 'GET', body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(API_BASE + endpoint, opts);
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/* ---------- navbar auth state ---------- */
function updateNavAuth() {
  const user = getUser();
  document.querySelectorAll('.nav-login').forEach(el => {
    el.style.display = user ? 'none' : '';
  });
  document.querySelectorAll('.nav-signup').forEach(el => {
    el.style.display = user ? 'none' : '';
  });
  document.querySelectorAll('.nav-user-menu').forEach(el => {
    el.style.display = user ? 'flex' : 'none';
  });
  document.querySelectorAll('.nav-user-name').forEach(el => {
    if (user) el.textContent = user.name.split(' ')[0];
  });
}
