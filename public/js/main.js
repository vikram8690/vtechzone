/* =============================================
   vTechZone - Main JavaScript
   ============================================= */

const API = 'http://localhost:5000/api';

// ====== AUTH UTILITIES ======
const Auth = {
  getToken: () => localStorage.getItem('vtechzone_token'),
  getUser: () => {
    const u = localStorage.getItem('vtechzone_user');
    return u ? JSON.parse(u) : null;
  },
  setSession: (token, user) => {
    localStorage.setItem('vtechzone_token', token);
    localStorage.setItem('vtechzone_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('vtechzone_token');
    localStorage.removeItem('vtechzone_user');
  },
  isAdmin: () => {
    const user = Auth.getUser();
    return user && user.role === 'admin';
  },
  isLoggedIn: () => !!Auth.getToken()
};

// ====== API HELPER ======
async function apiCall(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(Auth.getToken() ? { 'Authorization': `Bearer ${Auth.getToken()}` } : {})
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${endpoint}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ====== NAVBAR ======
document.addEventListener('DOMContentLoaded', () => {

  // Scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Hamburger menu
  const hamburger = document.querySelector('.hamburger');
  const navInner = document.querySelector('.nav-inner')?.parentElement;
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      document.querySelector('.navbar').classList.toggle('mobile-menu-open');
    });
  }

  // Active nav link
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
  });

  // Update nav based on auth
  updateNavAuth();
});

function updateNavAuth() {
  const user = Auth.getUser();
  const loginBtn = document.getElementById('nav-login');
  const signupBtn = document.getElementById('nav-signup');
  const dashBtn = document.getElementById('nav-dashboard');
  const logoutBtn = document.getElementById('nav-logout');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (dashBtn) {
      dashBtn.style.display = 'inline-flex';
      dashBtn.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
      dashBtn.textContent = user.role === 'admin' ? '⚙ Admin Panel' : '👤 Dashboard';
    }
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (signupBtn) signupBtn.style.display = 'inline-flex';
    if (dashBtn) dashBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

function logout() {
  Auth.clear();
  window.location.href = '/';
}

// ====== ALERT HELPER ======
function showAlert(id, msg, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 5000);
}

// ====== BUTTON LOADING ======
function setLoading(btn, loading) {
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}

// ====== MODAL HELPERS ======
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// ====== COUNTER ANIMATION ======
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.count);
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      counter.textContent = Math.floor(current) + (counter.dataset.suffix || '');
    }, 25);
  });
}

// Intersection Observer for counters
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounters(); observer.disconnect(); }
  });
}, { threshold: 0.3 });
const statsSection = document.querySelector('.about-stats');
if (statsSection) observer.observe(statsSection);
