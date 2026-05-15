(() => {
  const state = {
    entries: [],
    filtered: [],
    query: '',
    tag: 'all',
    activeEntry: null,
    styles: new Map()
  };

  const grid = document.getElementById('prompt-grid');
  const count = document.getElementById('prompt-count');
  const search = document.getElementById('prompt-search');
  const filters = document.getElementById('prompt-filters');
  const dialog = document.getElementById('prompt-dialog');
  const dialogTitle = document.getElementById('prompt-dialog-title');
  const dialogTags = document.getElementById('prompt-dialog-tags');
  const dialogPrompt = document.getElementById('prompt-dialog-prompt');
  const dialogImagePrompt = document.getElementById('prompt-dialog-image-prompt');
  const dialogMedia = document.getElementById('prompt-dialog-media');
  const imageModal = document.getElementById('promptImageModal');
  const imageModalImg = document.getElementById('promptImageFull');

  init();

  async function init() {
    try {
      const [data, styleSystem] = await Promise.all([
        fetch('/assets/data/prompts.json').then(response => response.json()),
        fetch('/assets/data/style-system.json').then(response => response.json()).catch(() => null)
      ]);
      state.entries = data.entries || [];
      state.styles = buildStyleMap(styleSystem);
      state.filtered = state.entries;
      buildFilters();
      render();
      bindEvents();
      preventCopy();
      initSmoothScroll();
      initSmoothTextAreas();
      initBlurText();
    } catch (error) {
      grid.innerHTML = '<div class="prompt-empty">Prompt 数据加载失败，请检查 assets/data/prompts.json。</div>';
      console.warn('[prompts] failed to load prompts.json', error);
    }
  }

  function preventCopy() {
    document.addEventListener('copy', event => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const selectedText = selection.toString();
      if (!selectedText) return;

      const commonAncestor = selection.getRangeAt(0).commonAncestorContainer;
      const isInDialog = commonAncestor.nodeType === Node.ELEMENT_NODE
        ? commonAncestor.closest('.prompt-dialog-body')
        : commonAncestor.parentElement?.closest('.prompt-dialog-body');

      if (isInDialog) {
        return;
      }

      if (selectedText.length > 50) {
        event.preventDefault();
      }
    });
  }

  function bindEvents() {
    search.addEventListener('input', event => {
      state.query = event.target.value.trim().toLowerCase();
      render();
    });

    filters.addEventListener('click', event => {
      const chip = event.target.closest('[data-tag]');
      if (!chip) return;
      state.tag = chip.dataset.tag;
      [...filters.querySelectorAll('.prompt-chip')].forEach(item => {
        item.classList.toggle('is-active', item.dataset.tag === state.tag);
      });
      render();
    });

    grid.addEventListener('click', event => {
      const copyButton = event.target.closest('[data-copy-prompt]');
      if (copyButton) {
        event.stopPropagation();
        const entry = getEntry(copyButton.dataset.copyPrompt);
        copyText(entry.prompt, copyButton);
        return;
      }
      const card = event.target.closest('[data-entry-id]');
      if (!card) return;
      const entry = getEntry(card.dataset.entryId);
      if (event.target.matches('img[data-preview-image]')) {
        event.stopPropagation();
        openImageModal(entry);
      } else {
        openDialog(entry);
      }
      addRipple(card, event.clientX, event.clientY);
    });

    dialog.addEventListener('click', event => {
      const closeBtn = event.target.closest('[data-close-dialog]');
      if (event.target === dialog) {
        closeDialog();
        return;
      }
      if (closeBtn) {
        closeDialog();
        return;
      }
      const copyBtn = event.target.closest('[data-copy]');
      if (copyBtn && state.activeEntry) {
        event.stopPropagation();
        const copyType = copyBtn.dataset.copy;
        const text = copyType === 'json'
          ? buildImagePromptJson(state.activeEntry)
          : state.activeEntry.prompt;
        copyText(text, copyBtn);
      }
    });

    dialog.addEventListener('wheel', event => {
      event.stopPropagation();
    }, { passive: false });

    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      closeDialog();
    });

    imageModal.addEventListener('click', closeImageModal);
    imageModal.addEventListener('wheel', event => {
      event.preventDefault();
      event.stopPropagation();
    }, { passive: false });

    window.addEventListener('keydown', event => {
      if (event.key === 'Escape' && imageModal.classList.contains('is-visible')) {
        closeImageModal();
      } else if (event.key === 'Escape' && dialog.open) {
        closeDialog();
      }
    });
  }

  function initSmoothScroll() {
    let scrollTarget = window.scrollY;
    let scrollPos = window.scrollY;
    let wheelActive = false;
    let wheelTimer;

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    window.addEventListener('wheel', event => {
      if (document.body.classList.contains('has-image-modal') || document.body.classList.contains('has-open-dialog')) {
        return;
      }
      event.preventDefault();
      wheelActive = true;
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => { wheelActive = false; }, 200);
      let delta = event.deltaY;
      if (delta > 80) delta = 80;
      if (delta < -80) delta = -80;
      scrollTarget += delta * 0.8;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = Math.max(0, Math.min(scrollTarget, max));
    }, { passive: false });

    window.addEventListener('scroll', () => {
      if (!wheelActive) {
        scrollTarget = window.scrollY;
        scrollPos = window.scrollY;
      }
    }, { passive: true });

    (function animateScroll() {
      if (wheelActive) {
        scrollPos = lerp(scrollPos, scrollTarget, 0.05);
        window.scrollTo(0, scrollPos);
      }
      requestAnimationFrame(animateScroll);
    })();
  }

  function initSmoothTextAreas() {
    const scrollers = document.querySelectorAll('.prompt-dialog-body pre');
    scrollers.forEach(scroller => {
      let scrollTarget = scroller.scrollTop;
      let scrollPos = scroller.scrollTop;
      let wheelActive = false;
      let wheelTimer;

      function lerp(a, b, t) {
        return a + (b - a) * t;
      }

      function clampTarget() {
        const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        scrollTarget = Math.max(0, Math.min(scrollTarget, max));
      }

      scroller.addEventListener('wheel', event => {
        event.preventDefault();
        event.stopPropagation();
        wheelActive = true;
        clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => { wheelActive = false; }, 180);
        let delta = event.deltaY;
        if (delta > 80) delta = 80;
        if (delta < -80) delta = -80;
        scrollTarget += delta * 0.8;
        clampTarget();
      }, { passive: false });

      scroller.addEventListener('scroll', () => {
        if (!wheelActive) {
          scrollTarget = scroller.scrollTop;
          scrollPos = scroller.scrollTop;
        }
      }, { passive: true });

      (function animateScroller() {
        if (wheelActive) {
          clampTarget();
          scrollPos = lerp(scrollPos, scrollTarget, 0.05);
          scroller.scrollTop = scrollPos;
        }
        requestAnimationFrame(animateScroller);
      })();
    });
  }

  function initBlurText() {
    const nodes = document.querySelectorAll('[data-blur-text], .blur-text-manual');
    if (!nodes.length) return;

    nodes.forEach(node => {
      if (!node.hasAttribute('data-blur-text')) return;

      const text = node.dataset.blurText || node.textContent.trim();
      const by = node.dataset.blurBy || 'words';
      const segments = by === 'chars' ? text.split('') : text.split(' ');
      node.textContent = '';
      node.classList.add('blur-text');

      segments.forEach((segment, index) => {
        const span = document.createElement('span');
        span.className = 'blur-segment';
        span.style.setProperty('--blur-delay', `${index * 200}ms`);
        span.textContent = segment;
        node.appendChild(span);
        if (by === 'words' && index < segments.length - 1) {
          node.appendChild(document.createTextNode('\u00A0'));
        }
      });
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    nodes.forEach(node => observer.observe(node));
  }

  function buildFilters() {
    const tags = new Map();
    state.entries.forEach(entry => {
      (entry.tags || []).forEach(tag => tags.set(tag, (tags.get(tag) || 0) + 1));
    });
    const sortedTags = [...tags.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    filters.innerHTML = [
      `<button class="prompt-chip is-active" type="button" data-tag="all">ALL ${state.entries.length}</button>`,
      ...sortedTags.map(([tag, amount]) => `<button class="prompt-chip" type="button" data-tag="${escapeAttr(tag)}">${escapeHtml(tag)} ${amount}</button>`)
    ].join('');
  }

  function render() {
    state.filtered = state.entries.filter(matchesCurrentFilter);
    count.textContent = String(state.filtered.length);
    if (state.filtered.length === 0) {
      grid.innerHTML = '<div class="prompt-empty">没有匹配的提示词。</div>';
      return;
    }
    grid.innerHTML = state.filtered.map(renderCard).join('');
    bindMagicBento();
  }

  function matchesCurrentFilter(entry) {
    const matchesTag = state.tag === 'all' || (entry.tags || []).includes(state.tag);
    if (!matchesTag) return false;
    if (!state.query) return true;
    const haystack = [
      entry.title,
      entry.industry,
      entry.type,
      entry.styleName,
      entry.cmf,
      (entry.tags || []).join(' '),
      entry.prompt,
      entry.imagePrompt
    ].join(' ').toLowerCase();
    return haystack.includes(state.query);
  }

  function renderCard(entry) {
    const tags = (entry.tags || []).slice(0, 4).map(tag => `<span class="prompt-card-tag">${escapeHtml(tag)}</span>`).join('');
    return `
      <article class="prompt-card mb-card" data-entry-id="${escapeAttr(entry.id)}">
        <div class="prompt-card-media">
          ${renderMedia(entry)}
        </div>
        <div class="prompt-card-body">
          <h2>${escapeHtml(entry.title)}</h2>
          <div class="prompt-card-meta">${tags}</div>
          <p class="prompt-card-prompt">${escapeHtml(entry.prompt)}</p>
          <div class="prompt-card-actions">
            <button class="prompt-copy" type="button" data-copy-prompt="${escapeAttr(entry.id)}">COPY</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderMedia(entry) {
    if (entry.image) {
      return `<img src="${escapeAttr(entry.image)}" alt="${escapeAttr(entry.title)}" loading="lazy" data-preview-image>`;
    }
    return `<div class="prompt-placeholder"><span>${escapeHtml(entry.title)}<br>IMAGE GENERATION PENDING</span></div>`;
  }

  function openDialog(entry) {
    state.activeEntry = entry;
    dialogTitle.textContent = entry.title;
    dialogTags.innerHTML = (entry.tags || []).map(tag => `<span class="prompt-card-tag">${escapeHtml(tag)}</span>`).join('');
    dialogPrompt.textContent = entry.prompt;
    dialogImagePrompt.textContent = buildImagePromptJson(entry);
    dialogPrompt.scrollTop = 0;
    dialogImagePrompt.scrollTop = 0;
    dialogMedia.innerHTML = renderDialogMedia(entry);
    dialog.showModal();
    document.documentElement.classList.add('has-open-dialog');
    document.body.classList.add('has-open-dialog');
    window.setTimeout(() => dialog.classList.add('show'), 10);
  }

  function renderDialogMedia(entry) {
    if (entry.image) {
      return `<img src="${escapeAttr(entry.image)}" alt="${escapeAttr(entry.title)}" loading="lazy">`;
    }
    return `<div class="prompt-placeholder"><span>${escapeHtml(entry.title)}<br>IMAGE GENERATION PENDING</span></div>`;
  }

  function openImageModal(entry) {
    if (!entry?.image) return;
    state.activeEntry = entry;
    imageModalImg.src = entry.image;
    imageModalImg.alt = entry.title || '';
    imageModal.classList.add('is-visible');
    imageModal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('has-image-modal');
    document.body.classList.add('has-image-modal');
    window.setTimeout(() => imageModal.classList.add('show'), 10);
  }

  function closeImageModal() {
    imageModal.classList.remove('show');
    window.setTimeout(() => {
      imageModal.classList.remove('is-visible');
      imageModal.setAttribute('aria-hidden', 'true');
      imageModalImg.removeAttribute('src');
      document.documentElement.classList.remove('has-image-modal');
      document.body.classList.remove('has-image-modal');
      state.activeEntry = null;
    }, 300);
  }

  function closeDialog() {
    dialog.classList.remove('show');
    window.setTimeout(() => {
      if (dialog.open) dialog.close();
      document.documentElement.classList.remove('has-open-dialog');
      document.body.classList.remove('has-open-dialog');
      state.activeEntry = null;
    }, 300);
  }

  function buildImagePromptJson(entry) {
    const fallbackNegativePrompt = [
      'people',
      'text',
      'watermark',
      'logo',
      'low resolution',
      'distorted furniture',
      'unrealistic perspective',
      'over-saturated color',
      'mixed style conflict',
      'cluttered composition'
    ];

    const negativePrompt = entry.negativePrompt
      ? entry.negativePrompt.split(',').map(item => item.trim()).filter(Boolean)
      : fallbackNegativePrompt;

    const payload = {
      title: entry.title,
      type: entry.type || 'interior',
      industry: entry.industry || 'home',
      style_id: entry.styleId || '',
      style_name: entry.styleName || '',
      image_prompt: entry.imagePrompt || entry.prompt,
      cmf: getCmfPalette(entry),
      style_controls: [
        'photorealistic interior design photography',
        'PDF style-guide aligned CMF palette',
        'realistic furniture scale and material texture',
        'soft commercial interior lighting',
        'clean composition for home catalog use',
        'dominant style should stay visually consistent',
        'avoid mixing unrelated decor languages'
      ],
      negative_prompt: negativePrompt
    };
    return JSON.stringify(payload, null, 2);
  }

  function buildStyleMap(styleSystem) {
    const map = new Map();
    (styleSystem?.styles || []).forEach(style => {
      if (style?.id) map.set(style.id, style);
    });
    return map;
  }

  function getCmfPalette(entry) {
    const style = state.styles.get(entry.styleId);
    if (!style?.cmf) {
      return {
        base_colors: [],
        accent_colors: []
      };
    }
    return {
      base_colors: extractHexCodes(style.cmf.baseColors),
      accent_colors: extractHexCodes(style.cmf.accentColors)
    };
  }

  function extractHexCodes(values) {
    const matches = (values || [])
      .flatMap(value => String(value).match(/#[0-9a-fA-F]{6}\b/g) || [])
      .map(value => value.toUpperCase());
    return [...new Set(matches)];
  }

  function getEntry(id) {
    return state.entries.find(entry => entry.id === id);
  }

  async function copyText(text, button) {
    if (!text) return;
    const original = button.textContent;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      button.textContent = 'COPIED';
      window.setTimeout(() => { button.textContent = original; }, 1100);
    } catch (error) {
      console.warn('[prompts] copy failed', error);
      button.textContent = 'FAILED';
      window.setTimeout(() => { button.textContent = original; }, 1100);
    }
  }

  function bindMagicBento() {
    const cards = [...grid.querySelectorAll('.prompt-card')];
    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', event => {
        const rect = card.getBoundingClientRect();
        const rx = ((event.clientX - rect.left) / rect.width) * 100;
        const ry = ((event.clientY - rect.top) / rect.height) * 100;
        const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
        card.style.setProperty('--glow-x', `${rx}%`);
        card.style.setProperty('--glow-y', `${ry}%`);
        card.style.setProperty('--glow-intensity', '0.88');
        card.style.transform = `perspective(900px) rotateX(${(-dy * 4).toFixed(2)}deg) rotateY(${(dx * 4).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--glow-intensity', '0');
        card.style.transform = '';
      });
    });
  }

  function addRipple(card, x, y) {
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.15;
    const ripple = document.createElement('span');
    ripple.className = 'prompt-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x - rect.left - size / 2}px`;
    ripple.style.top = `${y - rect.top - size / 2}px`;
    ripple.style.background = 'rgba(255,255,255,0.18)';
    card.appendChild(ripple);
    ripple.animate(
      [
        { transform: 'scale(0)', opacity: 0.8 },
        { transform: 'scale(1)', opacity: 0 }
      ],
      { duration: 620, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    ).addEventListener('finish', () => ripple.remove());
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }
})();
