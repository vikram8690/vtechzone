/* ============================================================
   vTechZone — Ultra Premium Hero Slider
   GSAP text reveals + Swiper creative 3D effect + Parallax
   ============================================================ */
(function () {
  'use strict';

  let heroSwiper = null;
  let progressRaf = null;
  let progressStart = null;
  const DURATION = 5200; // ms per slide

  /* ── Init on DOM ready ───────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.hero-swiper-ultra')) return;
    if (typeof gsap === 'undefined' || typeof Swiper === 'undefined') {
      // Fallback: retry after 300ms if CDNs not yet loaded
      setTimeout(boot, 300);
    } else {
      boot();
    }
  });

  function boot() {
    if (typeof gsap === 'undefined' || typeof Swiper === 'undefined') return;
    initParticles();
    initSwiper();
    if (window.innerWidth > 1100) initParallax();
  }

  /* ── Reset a single slide to start state ─────────────── */
  function resetSlide(slide) {
    if (!slide) return;
    gsap.set(slide.querySelectorAll('.hl .word'), { y: '110%' });
    gsap.set(slide.querySelector('.slide-eyebrow'),    { opacity: 0, y: 18, scale: 0.92 });
    gsap.set(slide.querySelector('.slide-subheading'), { opacity: 0, y: 16 });
    gsap.set(slide.querySelector('.slide-ctas'),       { opacity: 0, y: 14 });
    gsap.set(slide.querySelector('.slide-stats'),      { opacity: 0, y: 12 });
    const visual = slide.querySelector('.slide-visual-3d');
    if (visual) gsap.set(visual, { opacity: 0, x: 55, rotateY: 12 });
  }

  /* ── Animate the active slide's elements in ─────────── */
  function animateSlide(slide, isInit) {
    if (!slide) return;
    const delay = isInit ? 0.45 : 0.05;
    const tl = gsap.timeline();

    // Badge
    const eyebrow = slide.querySelector('.slide-eyebrow');
    if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'back.out(2)' }, delay);

    // Heading words — reveal up from clip
    const words = slide.querySelectorAll('.hl .word');
    if (words.length) tl.to(words, { y: '0%', duration: 0.9, stagger: 0.08, ease: 'power4.out' }, delay + 0.05);

    // Subheading
    const sub = slide.querySelector('.slide-subheading');
    if (sub) tl.to(sub, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, delay + 0.28);

    // CTAs
    const ctas = slide.querySelector('.slide-ctas');
    if (ctas) tl.to(ctas, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, delay + 0.42);

    // Stats
    const stats = slide.querySelector('.slide-stats');
    if (stats) tl.to(stats, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, delay + 0.56);

    // 3D Visual card
    const visual = slide.querySelector('.slide-visual-3d');
    if (visual) tl.to(visual, { opacity: 1, x: 0, rotateY: 0, duration: 1.1, ease: 'power2.out' }, delay + 0.1);
  }

  /* ── Swiper ──────────────────────────────────────────── */
  function initSwiper() {
    const slides = document.querySelectorAll('.hero-slide-ultra');

    // Set all slides to initial (hidden) state
    slides.forEach(s => resetSlide(s));

    heroSwiper = new Swiper('.hero-swiper-ultra', {
      effect: 'creative',
      creativeEffect: {
        limitProgress: 2,
        shadowPerProgress: true,
        prev: {
          shadow: true,
          translate: ['-110%', 0, -300],
          rotate: [0, 8, 0],
          opacity: 0.3,
        },
        next: {
          translate: ['110%', 0, -300],
          rotate: [0, -8, 0],
          opacity: 0.6,
        },
      },
      speed: 980,
      loop: true,
      autoplay: false,
      grabCursor: true,
      keyboard: { enabled: true },
      pagination: {
        el: '.hero-pagination-ultra',
        clickable: true,
      },
      on: {
        init(sw) {
          const slide = sw.slides[sw.activeIndex];
          animateSlide(slide, true);
          updateCounter(sw);
          startProgress(sw);
          updateProgressGradient(sw);
        },
        slideChangeTransitionStart(sw) {
          stopProgress();
        },
        slideChangeTransitionEnd(sw) {
          // Reset ALL non-active slides
          sw.slides.forEach((s, i) => {
            if (i !== sw.activeIndex) resetSlide(s);
          });
          const slide = sw.slides[sw.activeIndex];
          animateSlide(slide, false);
          updateCounter(sw);
          startProgress(sw);
          updateProgressGradient(sw);
        },
      },
    });

    // Nav
    document.querySelector('.hero-nav-prev')?.addEventListener('click', () => {
      heroSwiper.slidePrev();
      stopProgress();
    });
    document.querySelector('.hero-nav-next')?.addEventListener('click', () => {
      heroSwiper.slideNext();
      stopProgress();
    });
  }

  /* ── Progress bar ────────────────────────────────────── */
  function startProgress(sw) {
    const fill = document.getElementById('heroProgressFill');
    if (!fill) return;
    stopProgress();
    fill.style.width = '0%';
    progressStart = performance.now();

    const tick = (now) => {
      const elapsed = now - progressStart;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      fill.style.width = pct + '%';
      if (elapsed < DURATION) {
        progressRaf = requestAnimationFrame(tick);
      } else {
        sw?.slideNext();
      }
    };
    progressRaf = requestAnimationFrame(tick);
  }

  function stopProgress() {
    if (progressRaf) { cancelAnimationFrame(progressRaf); progressRaf = null; }
  }

  /* Sync progress bar gradient to current slide's accent colors */
  function updateProgressGradient(sw) {
    const fill = document.getElementById('heroProgressFill');
    if (!fill || !sw) return;
    const active = sw.slides[sw.activeIndex];
    if (!active) return;
    const cs = getComputedStyle(active);
    const a1 = cs.getPropertyValue('--a1').trim() || '#60a5fa';
    const a2 = cs.getPropertyValue('--a2').trim() || '#a78bfa';
    fill.style.background = `linear-gradient(90deg, ${a1}, ${a2})`;
  }

  /* ── Slide counter ───────────────────────────────────── */
  function updateCounter(sw) {
    const curr  = document.getElementById('counterCurrent');
    const total = document.getElementById('counterTotal');
    if (!curr || !total || !sw) return;
    const realIdx = sw.realIndex ?? 0;
    const len = sw.slides ? sw.slides.length - (sw.loopedSlides || 0) * 2 : 4;

    gsap.to(curr, {
      opacity: 0, y: -12, duration: 0.15,
      onComplete: () => {
        curr.textContent  = String(realIdx + 1).padStart(2, '0');
        total.textContent = String(len).padStart(2, '0');
        gsap.fromTo(curr, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
      }
    });
  }

  /* ── Mouse parallax (desktop only) ──────────────────── */
  function initParallax() {
    let mx = 0, my = 0, cx = 0, cy = 0;

    document.querySelector('.hero-ultra')?.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 24;
      my = (e.clientY / window.innerHeight - 0.5) * 14;
    });

    const loop = () => {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;

      const active = document.querySelector('.hero-swiper-ultra .swiper-slide-active');
      if (active) {
        // Parallax shapes
        const shapes = active.querySelectorAll('.float-shape');
        shapes.forEach((s, i) => {
          const d = (i % 3 + 1) * 0.45;
          gsap.set(s, { x: cx * d, y: cy * d });
        });
        // 3D card tilt
        const wrap = active.querySelector('.visual-card-wrap');
        if (wrap) {
          gsap.set(wrap, {
            rotateY: cx * 0.28,
            rotateX: -cy * 0.28,
          });
        }
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ── Particle canvas ─────────────────────────────────── */
  function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    class Particle {
      constructor() { this.reset(true); }
      reset(scatter) {
        this.x    = scatter ? Math.random() * canvas.width  : (Math.random() < 0.5 ? 0 : canvas.width);
        this.y    = scatter ? Math.random() * canvas.height : Math.random() * canvas.height;
        this.vx   = (Math.random() - 0.5) * 0.4;
        this.vy   = (Math.random() - 0.5) * 0.4;
        this.r    = Math.random() * 1.4 + 0.4;
        this.maxA = Math.random() * 0.22 + 0.04;
        this.life = 0;
        this.maxL = Math.random() * 280 + 180;
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.life++;
        if (this.life > this.maxL || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height)
          this.reset(false);
      }
      draw() {
        const t = this.life / this.maxL;
        const a = Math.sin(t * Math.PI) * this.maxA;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 70 }, () => new Particle());

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(draw);
    };
    draw();
  }

})();
