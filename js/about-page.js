/* ============================================================
   ABOUT PAGE — about-page.js
   Amcol Ingeniería Ltda
   ============================================================ */

/* ── Hero underline expand ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const underline = document.getElementById('heroUnderline');
  if (underline) {
    requestAnimationFrame(() => underline.classList.add('expanded'));
  }
});

/* ── Animated stat counters ─────────────────────────────────── */
(function initCounters() {
  const cards = document.querySelectorAll('.stat-card');
  if (!cards.length) return;

  function animateCounter(el, target, duration) {
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    };
    requestAnimationFrame(update);
  }

  if (!('IntersectionObserver' in window)) {
    cards.forEach(card => {
      const numEl = card.querySelector('.stat-card__number');
      if (numEl) numEl.textContent = numEl.dataset.target;
    });
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const numEl = entry.target.querySelector('.stat-card__number');
      if (numEl && numEl.dataset.target) {
        animateCounter(numEl, parseInt(numEl.dataset.target), 1800);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  cards.forEach(card => io.observe(card));
})();
