/* CompanionCare — main.js
   Handles: theme toggle, smooth scroll to forms, form submission with success states
*/

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     1. THEME TOGGLE
     Reads [data-theme] on <html>. Stores preference in-memory;
     attempts localStorage but degrades gracefully if unavailable.
  ───────────────────────────────────────────────────────────── */
  let _storedTheme = null; // in-memory fallback
  const root = document.documentElement;

  function getStoredTheme() {
    return _storedTheme;
  }

  function setTheme(theme) {
    _storedTheme = theme;
    root.setAttribute('data-theme', theme);
    updateToggleLabel(theme);
  }

  function updateToggleLabel(theme) {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    const isDark = theme === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    // Swap icon: sun for dark mode (switch to light), moon for light mode (switch to dark)
    btn.innerHTML = isDark
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
           <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
           <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
           <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
           <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
           <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
         </svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
           <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
         </svg>`;
  }

  function initTheme() {
    const stored = getStoredTheme();
    const preferred = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(preferred);
  }

  function bindThemeToggle() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-theme-toggle]');
      if (!btn) return;
      const current = root.getAttribute('data-theme') || 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }


  /* ─────────────────────────────────────────────────────────────
     2. NAV SCROLL BEHAVIOUR
     Adds .nav--scrolled class when user scrolls down
  ───────────────────────────────────────────────────────────── */
  /* ─────────────────────────────────────────────────────────────
     2b. MOBILE HAMBURGER MENU
  ───────────────────────────────────────────────────────────── */
  function openMobileMenu() {
    var btn      = document.getElementById('nav-hamburger');
    var menu     = document.getElementById('mobile-menu');
    var backdrop = document.getElementById('mobile-backdrop');
    if (!btn || !menu) return;
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    menu.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  window.closeMobileMenu = function () {
    var btn      = document.getElementById('nav-hamburger');
    var menu     = document.getElementById('mobile-menu');
    var backdrop = document.getElementById('mobile-backdrop');
    if (!btn || !menu) return;
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  function initMobileMenu() {
    var btn      = document.getElementById('nav-hamburger');
    var backdrop = document.getElementById('mobile-backdrop');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      isOpen ? window.closeMobileMenu() : openMobileMenu();
    });
    if (backdrop) backdrop.addEventListener('click', window.closeMobileMenu);
    document.querySelectorAll('.mobile-menu__link').forEach(function (link) {
      link.addEventListener('click', function () { window.closeMobileMenu(); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') window.closeMobileMenu();
    });
  }


    function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 48);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ─────────────────────────────────────────────────────────────
     3. SMOOTH SCROLL TO WAITLIST FORMS
     Called from HTML: scrollToForm('family') / scrollToForm('companion')
  ───────────────────────────────────────────────────────────── */
  window.scrollToForm = function (type) {
    const targetId = type === 'companion' ? 'form-companion' : 'form-family';
    const el = document.getElementById(targetId);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // After scroll, pulse the form card to draw attention
    setTimeout(function () {
      el.classList.add('form-card--highlight');
      setTimeout(function () {
        el.classList.remove('form-card--highlight');
      }, 1200);
    }, 600);

    // Focus first input for accessibility
    setTimeout(function () {
      const firstInput = el.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus({ preventScroll: true });
    }, 800);
  };


  /* ─────────────────────────────────────────────────────────────
     4. FORM SUBMISSION
     No backend yet — stores to localStorage, shows success state.
     Sends a mailto fallback so the owner still gets notified.
  ───────────────────────────────────────────────────────────── */

  function serializeForm(form) {
    const data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = value.trim();
    });
    data._type = form.id;
    data._ts = new Date().toISOString();
    return data;
  }

  // In-memory waitlist store (persists for session duration)
  const _waitlistEntries = [];

  function storeEntry(data) {
    _waitlistEntries.push(data);
  }

  function showSuccess(formCard, successId) {
    const form = formCard.querySelector('form');
    const success = document.getElementById(successId);
    if (form) {
      form.style.transition = 'opacity 0.3s ease';
      form.style.opacity = '0';
      setTimeout(function () {
        form.style.display = 'none';
        if (success) {
          success.hidden = false;
          success.style.opacity = '0';
          // Trigger reflow then fade in
          void success.offsetHeight;
          success.style.transition = 'opacity 0.4s ease';
          success.style.opacity = '1';
        }
      }, 300);
    }
  }

  function validateForm(form) {
    let valid = true;
    // Clear existing errors
    form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
    form.querySelectorAll('.field--error').forEach(function (el) { el.classList.remove('field--error'); });

    form.querySelectorAll('[required]').forEach(function (input) {
      if (!input.value.trim()) {
        valid = false;
        const field = input.closest('.field');
        if (field) {
          field.classList.add('field--error');
          const msg = document.createElement('span');
          msg.className = 'field-error';
          msg.textContent = input.type === 'email' ? 'Please enter a valid email address.' : 'This field is required.';
          field.appendChild(msg);
        }
      } else if (input.type === 'email') {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(input.value.trim())) {
          valid = false;
          const field = input.closest('.field');
          if (field) {
            field.classList.add('field--error');
            const msg = document.createElement('span');
            msg.className = 'field-error';
            msg.textContent = 'Please enter a valid email address.';
            field.appendChild(msg);
          }
        }
      }
    });

    return valid;
  }

  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xlgoooon';

  function setSubmitState(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Sending…' : btn.dataset.label;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const formCard = form.closest('.form-card');
    const submitBtn = form.querySelector('[type="submit"]');

    if (!validateForm(form)) return;

    // Stash the button label before disabling
    if (submitBtn && !submitBtn.dataset.label) {
      submitBtn.dataset.label = submitBtn.textContent;
    }
    setSubmitState(submitBtn, true);

    const data = serializeForm(form);
    storeEntry(data);

    const successId = form.id === 'family-form' ? 'family-success' : 'companion-success';

    // POST to Formspree
    fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function (res) {
      if (res.ok) {
        showSuccess(formCard, successId);
      } else {
        return res.json().then(function (body) {
          throw new Error((body && body.error) || 'Submission failed');
        });
      }
    })
    .catch(function (err) {
      // Re-enable the button and show a gentle inline error
      setSubmitState(submitBtn, false);
      var existing = form.querySelector('.form-submit-error');
      if (!existing) {
        var errMsg = document.createElement('p');
        errMsg.className = 'form-submit-error';
        errMsg.textContent = 'Something went wrong — please try again or email us at hello@mycompanioncare.co.uk';
        submitBtn.insertAdjacentElement('afterend', errMsg);
      }
      console.warn('Formspree error:', err);
    });
  }

  function initForms() {
    ['family-form', 'companion-form'].forEach(function (id) {
      const form = document.getElementById(id);
      if (form) form.addEventListener('submit', handleSubmit);
    });

    // Live email validation feedback
    document.querySelectorAll('input[type="email"]').forEach(function (input) {
      input.addEventListener('blur', function () {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const field = input.closest('.field');
        if (!field) return;
        field.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
        field.classList.remove('field--error');
        if (input.value && !emailRe.test(input.value.trim())) {
          field.classList.add('field--error');
          const msg = document.createElement('span');
          msg.className = 'field-error';
          msg.textContent = 'Please enter a valid email address.';
          field.appendChild(msg);
        }
      });
    });
  }


  /* ─────────────────────────────────────────────────────────────
     5. ENTRANCE ANIMATIONS
     Lightweight intersection observer — no external library needed
  ───────────────────────────────────────────────────────────── */
  function initAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll(
      '.step, .plan, .split-card, .form-card, .trust-item, .hero__card, .hero__stat'
    );

    targets.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(function (el) { observer.observe(el); });
  }


  /* ─────────────────────────────────────────────────────────────
     6. FORM CARD HIGHLIGHT PULSE (CSS class hook)
     Added/removed by scrollToForm — style defined in CSS
  ───────────────────────────────────────────────────────────── */
  // Ensure the class is cleaned up if CSS transition fires early
  document.addEventListener('animationend', function (e) {
    if (e.target.classList.contains('form-card--highlight')) {
      e.target.classList.remove('form-card--highlight');
    }
  });


  /* ─────────────────────────────────────────────────────────────
     7. LAZY VIDEO LOADING
     Videos with data-src are only loaded + played when they
     scroll into the viewport, saving ~600KB on initial load.
  ───────────────────────────────────────────────────────────── */
  function initLazyVideos() {
    var videos = document.querySelectorAll('video[data-src]');
    if (!videos.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: load immediately
      videos.forEach(function (v) {
        v.src = v.dataset.src;
        v.play().catch(function () {});
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var video = entry.target;
        video.src = video.dataset.src;
        video.load();
        video.play().catch(function () {});
        observer.unobserve(video);
      });
    }, { rootMargin: '200px' }); // start loading 200px before it enters viewport

    videos.forEach(function (v) { observer.observe(v); });
  }

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */
  function init() {
    initTheme();
    bindThemeToggle();
    initMobileMenu();
    initNavScroll();
    initForms();
    initAnimations();
    initLazyVideos();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
