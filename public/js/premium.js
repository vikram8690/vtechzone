/* ============================================================
   vTechZone — Premium JS
   Features: Swiper slider, AOS, dark mode, back-to-top,
             toast notifications, scroll animations
   ============================================================ */

/* ---- Dark Mode ---- */
(function initDarkMode() {
  const saved = localStorage.getItem('vtechzone_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateDarkIcon(saved);
})();

function updateDarkIcon(theme) {
  document.querySelectorAll('.dark-toggle').forEach(btn => {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  });
}

function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('vtechzone_theme', next);
  updateDarkIcon(next);
}

/* ---- Toast System ---- */
let toastContainer;
function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(msg, type = 'info', duration = 3500) {
  const container = ensureToastContainer();
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* ---- Back To Top ---- */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---- Navbar Scroll Effect ---- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const handler = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  handler(); // run once on init
  window.addEventListener('scroll', handler, { passive: true });
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
  const hamburger   = document.getElementById('hamburger');
  const mobileClose = document.getElementById('mobileClose');
  const mobileMenu  = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click',   () => mobileMenu.classList.add('open'));
  }
  if (mobileClose && mobileMenu) {
    mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
  }
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      if (!mobileMenu.contains(e.target) && !hamburger?.contains(e.target)) {
        mobileMenu.classList.remove('open');
      }
    }
  });
}

/* ---- Scroll Reveal (lightweight AOS-style) ---- */
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  targets.forEach(el => observer.observe(el));
}

/* ---- Counter Animation ---- */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current) + suffix;
  }, 16);
}

function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); observer.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  els.forEach(el => observer.observe(el));
}

/* ---- Hero Swiper Slider ---- */
function initHeroSwiper() {
  if (typeof Swiper === 'undefined') return;
  const el = document.querySelector('.hero-swiper');
  if (!el) return;

  const swiper = new Swiper('.hero-swiper', {
    loop: true,
    speed: 900,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    effect: 'fade',
    fadeEffect: { crossFade: true },
    pagination: {
      el: '.hero-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.hero-next',
      prevEl: '.hero-prev',
    },
    keyboard: { enabled: true },
    a11y: {
      prevSlideMessage: 'Previous slide',
      nextSlideMessage: 'Next slide',
    },
  });

  // Progress bar per slide
  const progress = document.querySelector('.hero-progress');
  if (progress) {
    let bar = 0;
    let raf;
    const reset = () => { bar = 0; progress.style.width = '0%'; };
    const run = () => {
      cancelAnimationFrame(raf);
      reset();
      const start = performance.now();
      const total = 5000;
      const tick = (now) => {
        bar = Math.min(((now - start) / total) * 100, 100);
        progress.style.width = bar + '%';
        if (bar < 100) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    swiper.on('slideChangeTransitionStart', run);
    run();
  }

  return swiper;
}

/* ---- Loading Screen ---- */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 500);
  });
}

/* ---- Hero Counter (index page) ---- */
function initHeroCounter() {
  const el = document.getElementById('heroCounter');
  if (!el) return;
  const target = 500;
  let count = 0;
  const timer = setInterval(() => {
    count += 8;
    if (count >= target) { count = target; clearInterval(timer); }
    el.textContent = count + '+';
  }, 20);
}

/* ---- Nav user click ---- */
function initUserMenu() {
  document.querySelectorAll('.nav-user-menu').forEach(el => {
    el.addEventListener('click', () => {
      const user = typeof getUser === 'function' ? getUser() : null;
      if (user && user.role === 'admin') window.location.href = '/admin';
      else window.location.href = '/dashboard';
    });
  });
}

/* ---- Page Transition (fade) ---- */
function initPageTransitions() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('http') || href.startsWith('https')) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 280);
    });
  });
}

/* ---- Init All ---- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initBackToTop();
  initScrollReveal();
  initCounters();
  initHeroCounter();
  initUserMenu();

  // Dark mode toggle click
  document.querySelectorAll('.dark-toggle').forEach(btn => {
    btn.addEventListener('click', toggleDarkMode);
  });
});

window.addEventListener('load', () => {
  initHeroSwiper();
  initLoader();

  // AOS-style: reveal elements after load
  setTimeout(() => {
    document.querySelectorAll('.fade-in').forEach((el, i) => {
      el.style.animationDelay = (i * 0.08) + 's';
    });
  }, 100);
});

/* expose toast globally */
window.showToast = showToast;
