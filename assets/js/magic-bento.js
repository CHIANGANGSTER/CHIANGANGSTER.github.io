/* Magic Bento card interaction for workflow detail pages:
   cursor-follow glow + 3D tilt + magnetism + click ripple, plus hero-demo tilt.
   Safe-exits when no target elements, idempotent, and disabled under
   prefers-reduced-motion. Targets: .info-card, .chapter, [data-demo-magnet]. */
(() => {
  if (window.__kbMagicBento) return;
  window.__kbMagicBento = true;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const GLOW_COLOR = '255, 255, 255';
  const RADIUS = 200;
  const lerp = (a, b, t) => a + (b - a) * t;

  function bindDemoMagnetism(target) {
    if (target.dataset.demoMagBound === 'true') return;
    target.dataset.demoMagBound = 'true';
    target.addEventListener('mousemove', (event) => {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      target.style.transform =
        'perspective(1200px) rotateX(' + (y * -3.5).toFixed(2) + 'deg) rotateY(' + (x * 3.5).toFixed(2) + 'deg)';
    });
    target.addEventListener('mouseleave', () => { target.style.transform = ''; });
  }

  function updateGlow(card, mx, my, intensity) {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--glow-x', (((mx - rect.left) / rect.width) * 100) + '%');
    card.style.setProperty('--glow-y', (((my - rect.top) / rect.height) * 100) + '%');
    card.style.setProperty('--glow-intensity', intensity.toFixed(3));
    card.style.setProperty('--glow-radius', RADIUS + 'px');
  }

  function bindCardTiltAndRipple(card) {
    let tiltX = 0;
    let tiltY = 0;
    let magX = 0;
    let magY = 0;
    let animRaf;

    function applyTransform() {
      card.style.transform = [
        'perspective(1200px)',
        'rotateX(' + tiltX.toFixed(2) + 'deg)',
        'rotateY(' + tiltY.toFixed(2) + 'deg)',
        'translate(' + magX.toFixed(2) + 'px,' + magY.toFixed(2) + 'px)'
      ].join(' ');
    }

    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      tiltX = lerp(tiltX, ((y - cy) / cy) * -6, 0.25);
      tiltY = lerp(tiltY, ((x - cx) / cx) * 6, 0.25);
      magX = lerp(magX, (x - cx) * 0.04, 0.15);
      magY = lerp(magY, (y - cy) * 0.04, 0.15);
      applyTransform();
    });

    card.addEventListener('mouseleave', () => {
      function springBack() {
        tiltX = lerp(tiltX, 0, 0.15);
        tiltY = lerp(tiltY, 0, 0.15);
        magX = lerp(magX, 0, 0.15);
        magY = lerp(magY, 0, 0.15);
        applyTransform();
        if (Math.abs(tiltX) > 0.01 || Math.abs(tiltY) > 0.01 || Math.abs(magX) > 0.01 || Math.abs(magY) > 0.01) {
          animRaf = requestAnimationFrame(springBack);
        } else {
          card.style.transform = '';
        }
      }
      cancelAnimationFrame(animRaf);
      springBack();
    });

    card.addEventListener('click', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxR = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement('div');
      ripple.className = 'mb-ripple';
      ripple.style.cssText = [
        'width:' + (maxR * 2) + 'px',
        'height:' + (maxR * 2) + 'px',
        'left:' + (x - maxR) + 'px',
        'top:' + (y - maxR) + 'px',
        'background:radial-gradient(circle,rgba(' + GLOW_COLOR + ',0.35) 0%,rgba(' + GLOW_COLOR + ',0.15) 30%,transparent 70%)'
      ].join(';');
      card.appendChild(ripple);
      ripple.animate(
        [{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }],
        { duration: 750, easing: 'ease-out' }
      ).onfinish = () => { ripple.remove(); };
    });
  }

  function init() {
    document.querySelectorAll('[data-demo-magnet]').forEach(bindDemoMagnetism);

    const cards = [];
    document.querySelectorAll('.info-card, .chapter').forEach((card) => {
      if (card.closest('.demo-media')) return;
      card.classList.add('mb-card');
      card.style.setProperty('--glow-color', GLOW_COLOR);
      if (card.dataset.mbBound !== 'true') {
        card.dataset.mbBound = 'true';
        bindCardTiltAndRipple(card);
      }
      cards.push(card);
    });

    // Safe exit: nothing to glow, skip the document-level listener.
    if (!cards.length || window.__kbMagicBentoGlow) return;
    window.__kbMagicBentoGlow = true;

    document.addEventListener('mousemove', (event) => {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dist = Math.hypot(event.clientX - cx, event.clientY - cy) - Math.max(rect.width, rect.height) / 2;
        dist = Math.max(0, dist);
        const intensity = dist <= 100 ? 1 : dist <= 150 ? (150 - dist) / 50 : 0;
        updateGlow(card, event.clientX, event.clientY, intensity);
      });
    });
    document.addEventListener('mouseleave', () => {
      cards.forEach((card) => { card.style.setProperty('--glow-intensity', '0'); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
