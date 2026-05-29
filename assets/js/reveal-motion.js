/* Shared line-by-line and card-rise reveal motion for knowledge-base pages. */
(() => {
  if (window.__kbRevealMotion) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lineObserver = reduceMotion ? null : new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      lineObserver.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  const cardObserver = reduceMotion ? null : new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      cardObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  const cardSelectors = [
    '.kb-card',
    '.prompt-card',
    '.tech-card',
    '.step-card',
    '.shortcut-item',
    '.qa-card',
    '.workflow-note-card',
    '.stage-card',
    '.compliance-box',
    '.comparison-item'
  ].join(',');

  function initLineReveal(root = document) {
    root.querySelectorAll('.line-reveal').forEach(container => {
      if (container.dataset.revealReady === 'true') return;
      container.dataset.revealReady = 'true';

      const lines = [...container.querySelectorAll('.line-reveal-item')];
      lines.forEach((line, index) => {
        if (!line.style.getPropertyValue('--reveal-delay')) {
          line.style.setProperty('--reveal-delay', `${index * 200}ms`);
        }
      });

      if (reduceMotion) {
        container.classList.add('is-visible');
      } else {
        lineObserver.observe(container);
      }
    });
  }

  function initCardReveal(root = document) {
    root.querySelectorAll(cardSelectors).forEach((card, index) => {
      if (card.dataset.cardRevealReady === 'true') return;
      card.dataset.cardRevealReady = 'true';
      card.classList.add('card-rise');
      card.style.setProperty('--card-rise-delay', `${Math.min(index % 8, 7) * 55}ms`);

      if (reduceMotion) {
        card.classList.add('is-visible');
      } else {
        cardObserver.observe(card);
      }
    });
  }

  function refresh(root = document) {
    initLineReveal(root);
    initCardReveal(root);
  }

  /* Public reveal for dynamically rendered content (e.g. hub cards). Applies the
     shared .card-rise / .is-visible system; callers own the trigger timing only. */
  function revealCards(target, options = {}) {
    const root = options.root || document;
    let cards;
    if (typeof target === 'string') {
      cards = [...root.querySelectorAll(target)];
    } else if (target instanceof Element) {
      cards = [target];
    } else {
      cards = [...(target || [])];
    }
    if (!cards.length) return;

    const stagger = options.stagger != null ? Number(options.stagger) : 55;
    const delay = Number(options.delay) || 0;

    cards.forEach((card, index) => {
      // Mark handled so the IntersectionObserver path does not double-bind.
      card.dataset.cardRevealReady = 'true';
      card.classList.add('card-rise');
      if (!card.style.getPropertyValue('--card-rise-delay')) {
        card.style.setProperty('--card-rise-delay', `${Math.min(index % 8, 7) * stagger}ms`);
      }
    });

    const show = () => cards.forEach(card => card.classList.add('is-visible'));

    if (reduceMotion) {
      show();
    } else if (delay > 0) {
      window.setTimeout(show, delay);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(show));
    }
  }

  window.__kbRevealMotion = true;
  window.KBRevealMotion = { refresh, revealCards };
  window.KBReveal = window.KBRevealMotion;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => refresh());
  } else {
    refresh();
  }

  const mutationObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        refresh(node);
        if (node.matches?.('.line-reveal,' + cardSelectors)) refresh(node.parentElement || document);
      });
    });
  });

  mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
})();
