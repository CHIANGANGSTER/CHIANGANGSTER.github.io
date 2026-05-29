(function () {
  if (window.__kbMagicBento) return;
  window.__kbMagicBento = true;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initDemoMagnetism() {
    document.querySelectorAll('[data-demo-magnet]').forEach(function (target) {
      if (target.dataset.demoMagBound === 'true') return;
      target.dataset.demoMagBound = 'true';
      if (reducedMotion) return;
      var card = target;
      var tiltX = 0;
      var tiltY = 0;
      var magX = 0;
      var magY = 0;
      var animRaf;
      function lerp(a, b, n) { return (1 - n) * a + n * b; }
      function applyTransform() {
        target.style.transform = [
          'perspective(1200px)',
          'rotateX(' + tiltX.toFixed(2) + 'deg)',
          'rotateY(' + tiltY.toFixed(2) + 'deg)',
          'translate(' + magX.toFixed(2) + 'px,' + magY.toFixed(2) + 'px)'
        ].join(' ');
      }
      function releaseRiseAnimation() { card.style.animation = 'none'; }
      card.addEventListener('animationend', releaseRiseAnimation, { once: true });
      window.setTimeout(releaseRiseAnimation, 3600);
      card.addEventListener('mousemove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        tiltX = ((y - cy) / cy) * -6;
        tiltY = ((x - cx) / cx) * 6;
        magX = lerp(magX, (x - cx) * 0.04, 0.15);
        magY = lerp(magY, (y - cy) * 0.04, 0.15);
        applyTransform();
      });
      card.addEventListener('mouseleave', function () {
        function springBack() {
          tiltX = lerp(tiltX, 0, 0.15);
          tiltY = lerp(tiltY, 0, 0.15);
          magX = lerp(magX, 0, 0.15);
          magY = lerp(magY, 0, 0.15);
          applyTransform();
          if (Math.abs(tiltX) > 0.01 || Math.abs(tiltY) > 0.01 || Math.abs(magX) > 0.01 || Math.abs(magY) > 0.01) {
            animRaf = requestAnimationFrame(springBack);
          } else {
            tiltX = tiltY = magX = magY = 0;
            target.style.transform = '';
          }
        }
        cancelAnimationFrame(animRaf);
        springBack();
      });
    });
  }

  function initMagicBento() {
    var scriptEl = document.querySelector('script[src*="magic-bento"]');
    var selector = (scriptEl && scriptEl.dataset.selectors) ||
      '.tech-card,.step-card,.qa-card,.workflow-note-card,.workflow-shot';
    var glowColor = '255, 255, 255';
    var radius = 200;
    var cards = [];
    document.querySelectorAll(selector).forEach(function (card) {
      card.classList.add('mb-card');
      card.style.setProperty('--glow-color', glowColor);
      cards.push(card);
    });
    if (!cards.length) return;
    function lerp(a, b, t) { return a + (b - a) * t; }
    function updateGlow(card, mx, my, intensity) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', (((mx - rect.left) / rect.width) * 100) + '%');
      card.style.setProperty('--glow-y', (((my - rect.top) / rect.height) * 100) + '%');
      card.style.setProperty('--glow-intensity', intensity.toFixed(3));
      card.style.setProperty('--glow-radius', radius + 'px');
    }
    if (!reducedMotion) {
      document.addEventListener('mousemove', function (event) {
        cards.forEach(function (card) {
          var rect = card.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dist = Math.hypot(event.clientX - cx, event.clientY - cy) - Math.max(rect.width, rect.height) / 2;
          dist = Math.max(0, dist);
          var intensity = dist <= 100 ? 1 : dist <= 150 ? (150 - dist) / 50 : 0;
          updateGlow(card, event.clientX, event.clientY, intensity);
        });
      });
      document.addEventListener('mouseleave', function () {
        cards.forEach(function (card) { card.style.setProperty('--glow-intensity', '0'); });
      });
    }
    cards.forEach(function (card) {
      if (reducedMotion) return;
      var tiltX = 0;
      var tiltY = 0;
      var magX = 0;
      var magY = 0;
      var animRaf;
      function applyTransform() {
        card.style.transform = [
          'perspective(1200px)',
          'rotateX(' + tiltX.toFixed(2) + 'deg)',
          'rotateY(' + tiltY.toFixed(2) + 'deg)',
          'translate(' + magX.toFixed(2) + 'px,' + magY.toFixed(2) + 'px)'
        ].join(' ');
      }
      card.addEventListener('mousemove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        tiltX = lerp(tiltX, ((y - cy) / cy) * -6, 0.25);
        tiltY = lerp(tiltY, ((x - cx) / cx) * 6, 0.25);
        magX = lerp(magX, (x - cx) * 0.04, 0.15);
        magY = lerp(magY, (y - cy) * 0.04, 0.15);
        applyTransform();
      });
      card.addEventListener('mouseleave', function () {
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
      card.addEventListener('click', function (event) {
        var rect = card.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var maxR = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height)
        );
        var ripple = document.createElement('div');
        ripple.className = 'mb-ripple';
        ripple.style.cssText = [
          'width:' + (maxR * 2) + 'px',
          'height:' + (maxR * 2) + 'px',
          'left:' + (x - maxR) + 'px',
          'top:' + (y - maxR) + 'px',
          'background:radial-gradient(circle,rgba(' + glowColor + ',0.35) 0%,rgba(' + glowColor + ',0.15) 30%,transparent 70%)'
        ].join(';');
        card.appendChild(ripple);
        ripple.animate(
          [{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }],
          { duration: 750, easing: 'ease-out' }
        ).onfinish = function () { ripple.remove(); };
      });
    });
  }

  initDemoMagnetism();
  initMagicBento();
})();
