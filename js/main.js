/* ============================================================
   AMCOL INGENIERÍA LTDA — main.js
   Navbar · Scroll · Mobile Menu · Tabs · Reveal · Form
   ============================================================ */

'use strict';

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── Year ──────────────────────────────────────────────────── */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── Hero image load (zoom-in trigger) ─────────────────────── */
const heroImg = $('#hero-img');
if (heroImg) {
  if (heroImg.complete) {
    heroImg.classList.add('loaded');
  } else {
    heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
  }
}

/* ─── Navbar ─────────────────────────────────────────────────── */
(function initNavbar() {
  const nav        = $('#navbar');
  const hamburger  = $('#hamburger');
  const drawer     = $('#mobile-drawer');
  if (!nav) return;

  /* Scroll: opaque + active link */
  const sections = $$('section[id]');
  const navH = () => parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')
  ) || 68;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('opaque', y > 20);

    // Scroll-top button
    const st = $('#scroll-top');
    if (st) st.classList.toggle('show', y > 400);

    // Active link
    let current = sections[0]?.id || '';
    sections.forEach(sec => {
      if (y >= sec.offsetTop - navH() - 32) current = sec.id;
    });

    $$('.navbar__link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${current}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hamburger */
  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      drawer.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    $$('a', drawer).forEach(a => {
      a.addEventListener('click', closeDrawer);
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    function closeDrawer() {
      drawer.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }
})();

/* ─── Scroll-to-top ─────────────────────────────────────────── */
const scrollTopBtn = $('#scroll-top');
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─── Reveal on scroll (IntersectionObserver) ───────────────── */
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ─── QSA Spotlight cards ────────────────────────────────────── */
(function initSpotlightCards() {
  const cards = $$('.qsa-card');
  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--x', x + 'px');
      card.style.setProperty('--y', y + 'px');
    });
  });
})();

/* ─── About tabs ─────────────────────────────────────────────── */
(function initTabs() {
  const tabs   = $$('.about-tab');
  const panels = $$('.about-panel');
  if (!tabs.length) return;

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = tab.getAttribute('aria-controls');
      const panel  = $(`#${target}`);
      if (panel) panel.classList.add('active');
    });

    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') tabs[(i + 1) % tabs.length].click();
      if (e.key === 'ArrowLeft')  tabs[(i - 1 + tabs.length) % tabs.length].click();
    });
  });
})();

/* ─── Smooth anchor scroll (offset navbar) ───────────────────── */
(function initAnchors() {
  const navH = () => parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')
  ) || 68;

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      if (hash === '#') return;
      const target = $(hash);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navH();
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ─── Contact form ───────────────────────────────────────────── */
(function initForm() {
  const form   = $('#contact-form');
  const status = $('#form-status');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const data    = new FormData(form);
    const nombre  = (data.get('nombre')  || '').trim();
    const email   = (data.get('email')   || '').trim();
    const mensaje = (data.get('mensaje') || '').trim();

    if (!nombre || !email || !mensaje) {
      return showStatus('Por favor completa los campos obligatorios (*).', false);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showStatus('Por favor ingresa un correo electrónico válido.', false);
    }

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    try {
      // Replace YOUR_FORM_ID with the Formspree form ID
      // Create a free form at https://formspree.io
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        form.reset();
        showStatus('¡Mensaje enviado! Le contactaremos pronto.', true);
      } else {
        throw new Error();
      }
    } catch {
      // Fallback: open mail client
      const sub  = encodeURIComponent(`Consulta END — ${nombre}`);
      const body = encodeURIComponent(
        `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${data.get('telefono') || ''}\nEmpresa: ${data.get('empresa') || ''}\nServicio: ${data.get('servicio') || ''}\n\n${mensaje}`
      );
      window.location.href = `mailto:gerencia@amcolingenieria.com?subject=${sub}&body=${body}`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Enviar Mensaje`;
    }
  });

  function showStatus(msg, ok) {
    if (!status) return;
    status.textContent  = msg;
    status.style.color  = ok ? '#4ade80' : '#f87171';
    status.style.display = 'block';
    if (ok) setTimeout(() => { status.style.display = 'none'; }, 7000);
  }
})();
