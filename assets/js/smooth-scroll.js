/* Shared wheel smoothing, aligned with the chair home page scroll feel. */
(() => {
  if (window.__kbSmoothScroll || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.__kbSmoothScroll = true;

  const lerp = (a, b, t) => a + (b - a) * t;
  let scrollTarget = window.scrollY;
  let scrollPos = window.scrollY;
  let wheelActive = false;
  let wheelTimer;

  window.addEventListener('wheel', event => {
    const modalOpen = document.documentElement.classList.contains('modal-open')
      || document.documentElement.classList.contains('image-modal-open')
      || document.body.classList.contains('modal-open')
      || document.body.classList.contains('image-modal-open');
    if (modalOpen) return;

    event.preventDefault();
    wheelActive = true;
    clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(() => { wheelActive = false; }, 200);

    let delta = event.deltaY;
    if (delta > 80) delta = 80;
    if (delta < -80) delta = -80;

    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    scrollTarget = Math.max(0, Math.min(scrollTarget + delta * 0.8, max));
  }, { passive: false });

  window.addEventListener('scroll', () => {
    if (!wheelActive) {
      scrollTarget = window.scrollY;
      scrollPos = window.scrollY;
    }
  });

  function tick() {
    if (wheelActive) {
      scrollPos = lerp(scrollPos, scrollTarget, 0.05);
      window.scrollTo(0, scrollPos);
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
