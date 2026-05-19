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
      initDecayCards();
      initPluginDemoMagnetism();
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

      scroller.__resetPromptScroller = () => {
        clearTimeout(wheelTimer);
        wheelActive = false;
        scrollTarget = 0;
        scrollPos = 0;
        scroller.scrollTop = 0;
      };

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

  function initDecayCards() {
    const cards = [...document.querySelectorAll('[data-decay-card]')];
    if (!cards.length) return;

    cards.forEach(card => {
      const displacementMap = card.querySelector('.prompt-decay-map');
      const turbulence = card.querySelector('feTurbulence');
      const width = Number(card.dataset.width) || 220;
      const height = Number(card.dataset.height) || 220;
      const baseFrequency = card.dataset.baseFrequency || '0.015';
      const numOctaves = card.dataset.numOctaves || '5';
      const seed = card.dataset.seed || '4';
      const maxDisplacement = Number(card.dataset.maxDisplacement) || 300;
      const movementBound = Number(card.dataset.movementBound) || 26;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      card.style.width = `${width}px`;
      card.style.height = `${height}px`;
      turbulence?.setAttribute('baseFrequency', baseFrequency);
      turbulence?.setAttribute('numOctaves', numOctaves);
      turbulence?.setAttribute('seed', seed);

      if (reduceMotion) return;

      let cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      let cachedCursor = { ...cursor };
      let winsize = { width: window.innerWidth, height: window.innerHeight };
      const transforms = { x: 0, y: 0, rz: 0 };
      let displacementScale = 0;

      const lerp = (a, b, n) => (1 - n) * a + n * b;
      const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
      const distance = (x1, x2, y1, y2) => Math.hypot(x1 - x2, y1 - y2);

      function handleResize() {
        winsize = { width: window.innerWidth, height: window.innerHeight };
      }

      function handleMouseMove(event) {
        cursor = { x: event.clientX, y: event.clientY };
      }

      window.addEventListener('resize', handleResize);
      window.addEventListener('mousemove', handleMouseMove);

      function renderDecayCard() {
        let targetX = lerp(transforms.x, map(cursor.x, 0, winsize.width, -80, 80), 0.1);
        let targetY = lerp(transforms.y, map(cursor.y, 0, winsize.height, -80, 80), 0.1);
        const targetRz = lerp(transforms.rz, map(cursor.x, 0, winsize.width, -7, 7), 0.1);

        if (targetX > movementBound) targetX = movementBound + (targetX - movementBound) * 0.2;
        if (targetX < -movementBound) targetX = -movementBound + (targetX + movementBound) * 0.2;
        if (targetY > movementBound) targetY = movementBound + (targetY - movementBound) * 0.2;
        if (targetY < -movementBound) targetY = -movementBound + (targetY + movementBound) * 0.2;

        transforms.x = targetX;
        transforms.y = targetY;
        transforms.rz = targetRz;
        card.style.transform = `translate3d(${transforms.x}px, ${transforms.y}px, 0) rotateZ(${transforms.rz}deg)`;

        const cursorTravelledDistance = distance(cachedCursor.x, cursor.x, cachedCursor.y, cursor.y);
        displacementScale = lerp(displacementScale, map(cursorTravelledDistance, 0, 200, 0, maxDisplacement), 0.06);
        displacementMap?.setAttribute('scale', String(Math.max(0, displacementScale)));

        cachedCursor = { ...cursor };
        requestAnimationFrame(renderDecayCard);
      }

      requestAnimationFrame(renderDecayCard);
    });
  }

  function buildFilters() {
    const tags = new Map();
    state.entries.forEach(entry => {
      (entry.tags || [])
        .filter(tag => tag !== 'Excel导入')
        .forEach(tag => tags.set(tag, (tags.get(tag) || 0) + 1));
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
    window.KBRevealMotion?.refresh(grid);
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
    resetDialogTextScrollers();
    dialogMedia.innerHTML = renderDialogMedia(entry);
    dialog.showModal();
    requestAnimationFrame(resetDialogTextScrollers);
    document.documentElement.classList.add('has-open-dialog');
    document.body.classList.add('has-open-dialog');
    window.setTimeout(() => dialog.classList.add('show'), 10);
  }

  function resetDialogTextScrollers() {
    [dialogPrompt, dialogImagePrompt].forEach(scroller => {
      if (typeof scroller.__resetPromptScroller === 'function') {
        scroller.__resetPromptScroller();
      } else {
        scroller.scrollTop = 0;
      }
    });
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

  const ENGLISH_TITLES_BY_ID = {
    'modern-minimal-001': 'Modern Minimalist Open Living Room',
    'modern-minimal-002': 'White Gray Geometric TV Wall',
    'modern-minimal-003': 'Urban Minimalist Home Office',
    'modern-minimal-004': 'Black White Gray Open Kitchen Dining Room',
    'modern-minimal-005': 'Modular Entryway Storage',
    'scandinavian-001': 'Light Wood Nordic Living Room',
    'scandinavian-002': 'Cloudy Blue Nordic Reading Corner',
    'scandinavian-003': 'White Wall Light Wood Dining Room',
    'scandinavian-004': 'Warm Nordic Bedroom',
    'scandinavian-005': 'Natural Nordic Workspace',
    'mid-century-modern-001': 'Walnut Mid-Century Living Room',
    'mid-century-modern-002': 'Aqua Blue Mid-Century Dining Room',
    'mid-century-modern-003': 'Mustard Yellow Mid-Century Study',
    'mid-century-modern-004': 'Olive Green Mid-Century Lounge Corner',
    'mid-century-modern-005': 'Walnut Mid-Century Living Dining Room',
    'modern-cream-001': 'Cream Curved Living Room',
    'modern-cream-002': 'Milk Tea Soft Mist Bedroom',
    'modern-cream-003': 'Soft Mist Cream Entryway',
    'modern-cream-004': 'Cloud Cream Reading Corner',
    'modern-cream-005': 'Cream Open Kitchen Dining Room',
    'light-luxury-001': 'Ivory Light Luxury Living Room',
    'light-luxury-002': 'Marble Light Luxury Dining Room',
    'light-luxury-003': 'Brass Glass Lounge Area',
    'light-luxury-004': 'Dark Green Light Luxury Study',
    'light-luxury-005': 'Hotel-Like Light Luxury Bedroom',
    'farmhouse-001': 'White Wall Farmhouse Kitchen',
    'farmhouse-002': 'Distressed Wood Farmhouse Dining Room',
    'farmhouse-003': 'Barn Door Farmhouse Living Room',
    'farmhouse-004': 'Sage Green Farmhouse Bedroom',
    'farmhouse-005': 'Vintage Farmhouse Sideboard Corner',
    'boho-001': 'Rattan Boho Living Room',
    'boho-002': 'Botanical Boho Lounge Corner',
    'boho-003': 'Ethnic Rug Boho Bedroom',
    'boho-004': 'Arched Rattan Boho Dining Room',
    'boho-005': 'Handmade Ceramic Boho Entryway',
    'light-industrial-001': 'Black Iron Industrial Living Room',
    'light-industrial-002': 'Concrete Wall Open Kitchen Dining Room',
    'light-industrial-003': 'Distressed Leather Industrial Reading Area',
    'light-industrial-004': 'Red Brick Industrial Study',
    'light-industrial-005': 'Metal Rack Industrial Entryway'
  };

  const STYLE_LABELS = {
    'modern-minimal': 'Modern minimalist style',
    'scandinavian': 'Modern Scandinavian style',
    'mid-century-modern': 'Mid-century modern style',
    'modern-cream': 'Modern cream style',
    'light-luxury': 'Modern light luxury style',
    'farmhouse': 'Pastoral farmhouse style',
    'boho': 'Boho natural style',
    'light-industrial': 'Light industrial style',
    'natural-wood': 'Natural wood style',
    'french': 'French-inspired style',
    'european-classic': 'European classic style',
    'american-classic': 'American classic style',
    'japanese': 'Japanese minimalist style',
    'new-chinese': 'New Chinese style',
    'realistic-interior': 'Photorealistic interior style',
    'interior-reference': 'Interior reference style'
  };

  const STYLE_ATMOSPHERES = {
    'modern-minimal': 'calm, clean, rational, urban, spacious',
    'scandinavian': 'warm, airy, natural, soft, livable',
    'mid-century-modern': 'warm, nostalgic, composed, tactile, timeless',
    'modern-cream': 'soft, healing, gentle, rounded, quiet',
    'light-luxury': 'refined, polished, premium, layered, understated',
    'farmhouse': 'rustic, welcoming, practical, warm, story-rich',
    'boho': 'relaxed, handmade, botanical, layered, free-spirited',
    'light-industrial': 'structured, raw, restrained, functional, material-driven',
    'natural-wood': 'warm, organic, clean, calm, material-focused',
    'french': 'elegant, soft, classical, refined, residential',
    'european-classic': 'formal, elegant, balanced, decorative, premium',
    'american-classic': 'comfortable, traditional, balanced, family-oriented, warm',
    'japanese': 'quiet, minimal, natural, restrained, contemplative',
    'new-chinese': 'composed, cultural, warm, balanced, poetic',
    'realistic-interior': 'realistic, clean, commercial, neutral, usable'
  };

  const FALLBACK_CMF = {
    'natural-wood': { base_colors: ['#F1EFE3', '#E6DFD7', '#B08A62', '#8A7E76'], accent_colors: ['#3A261E', '#2D5561'] },
    'french': { base_colors: ['#F7F5EF', '#F1EFE3', '#DAD7CE', '#CEAD77'], accent_colors: ['#B09868', '#7B1E25'] },
    'european-classic': { base_colors: ['#F1EFE3', '#E6DFD7', '#F1F1EF', '#8A7E76'], accent_colors: ['#B09868', '#26365E'] },
    'american-classic': { base_colors: ['#F7F5EF', '#E6DFD7', '#CEAD77', '#8A5A3B'], accent_colors: ['#26365E', '#7B1E25'] },
    'japanese': { base_colors: ['#F1EFE3', '#E6DFD7', '#CEAD77', '#8A7E76'], accent_colors: ['#1A1A1A', '#AAA794'] },
    'new-chinese': { base_colors: ['#F1EFE3', '#8A5A3B', '#3A261E', '#1A1A1A'], accent_colors: ['#7B1E25', '#B09868'] },
    'realistic-interior': { base_colors: ['#F7F5EF', '#C4C9CF', '#8A7E76', '#4A4A48'], accent_colors: ['#2D5561', '#B09868'] },
    'interior-reference': { base_colors: ['#F7F5EF', '#DAD7CE', '#8A7E76', '#4A4A48'], accent_colors: ['#26365E', '#7B1E25'] }
  };

  const TITLE_RULES = [
    [/[\u5ba2\u9910\u5385]/, 'open living-dining room'],
    [/[\u53a8\u623f]/, 'kitchen'],
    [/[\u9910\u5385]/, 'dining room'],
    [/[\u4e66\u623f]/, 'study room'],
    [/[\u5367\u5ba4]/, 'bedroom'],
    [/[\u7384\u5173]/, 'entryway'],
    [/[\u5ba2\u5385]/, 'living room'],
    [/[\u5899\u67dc]/, 'wall-cabinet scene'],
    [/[\u7535\u89c6\u5899]/, 'TV wall scene'],
    [/[\u58c1\u7089]/, 'fireplace scene'],
    [/[\u540a\u706f]/, 'pendant-light scene'],
    [/[\u7eff\u690d]/, 'botanical scene'],
    [/[\u81ea\u7136\u5149]/, 'natural-light scene'],
    [/[\u5f00\u653e]/, 'open-plan scene'],
    [/[\u539f\u6728]/, 'natural wood scene'],
    [/[\u6728\u8d28]/, 'wood material scene'],
    [/[\u9ed1\u8272]/, 'black-accent scene'],
    [/[\u7c73\u8272]/, 'beige scene'],
    [/[\u5976\u6cb9]/, 'cream-toned scene'],
    [/[\u8336\u5ba4]/, 'tea-room scene'],
    [/[\u5c55\u793a\u4e66\u67b6]/, 'display-shelf scene'],
    [/[\u6df7\u51dd\u571f]/, 'concrete interior scene']
  ];

  const TAG_RULES = [
    ['\u5ba2\u9910\u5385', 'open living-dining room'],
    ['\u5ba2\u5385', 'living room'],
    ['\u9910\u5385', 'dining room'],
    ['\u53a8\u623f', 'kitchen'],
    ['\u4e66\u623f', 'study room'],
    ['\u5367\u5ba4', 'bedroom'],
    ['\u7384\u5173', 'entryway'],
    ['\u6728\u8d28', 'wood'],
    ['\u76ae\u9769', 'leather'],
    ['\u5927\u7406\u77f3', 'marble'],
    ['\u91d1\u5c5e', 'metal'],
    ['\u5e03\u827a', 'fabric'],
    ['\u7eff\u690d', 'green plants']
  ];

  function buildImagePromptJson(entry) {
    const negativePrompt = entry.negativePrompt
      ? entry.negativePrompt.split(',').map(item => item.trim()).filter(Boolean)
      : [
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

    const title = getEnglishPromptTitle(entry);
    const style = getStyleLabel(entry);
    const room = getRoomLabel(entry);
    const materials = getMaterialLabels(entry);
    const cmf = getCmfPalette(entry);
    const positivePrompt = getEnglishPositivePrompt(entry, title, style, room, materials);

    const payload = {
      global_overview: {
        title: title,
        subject_matter: room + ' interior design scene',
        scene_type: 'Residential interior reference image',
        medium_texture: 'Photorealistic digital rendering, realistic material and lighting simulation',
        commercial_attributes: 'Prompt-library cover image, home catalog visualization, design-department style reference',
        style_genre: style,
        emotional_atmosphere: STYLE_ATMOSPHERES[entry.styleId] || 'clean, realistic, composed, commercially usable',
        period_feel: 'Contemporary interior styling with brand-aligned CMF control',
        narrative_sense: 'A reusable ' + room + ' reference scene for testing prompt structure, composition, materials and lighting consistency.'
      },
      composition_and_camera: {
        framing_scope: 'Medium-wide interior composition capturing the main furniture group and surrounding spatial context',
        shot_type: 'Interior design showcase shot',
        camera_height: 'Eye-level or slightly below eye-level for natural room scale',
        camera_angle: 'Straight-on with a mild three-quarter perspective when furniture depth needs to be shown',
        perspective_relationship: 'Controlled wide-angle perspective, spacious but without fisheye distortion',
        focal_length_impression: 'Approximately 24-35mm equivalent interior lens',
        subject_proportion: 'Main furniture and architectural features should read clearly without crowding the frame',
        cropping_method: 'Keep the primary room function visible; crop only secondary edges of the room',
        visual_center: title,
        reading_path: 'Guide the eye from the largest furniture form to supporting decor, lighting, material surfaces and background architecture',
        negative_space: 'Use clean wall, ceiling or floor areas to keep the scene breathable and catalog-ready'
      },
      spatial_layout: {
        top_to_bottom: [
          makeLayoutItem('ceiling and overhead lighting', 'top', 'background', 'sets the room scale and lighting direction'),
          makeLayoutItem('wall plane, window or display surface', 'upper-middle', 'background', 'anchors the interior style language'),
          makeLayoutItem('main furniture group', 'middle', 'midground', 'defines the scene function and visual center'),
          makeLayoutItem('rug, flooring and low tables', 'lower frame', 'foreground', 'grounds the composition and adds material texture')
        ],
        left_to_right: [
          makeLayoutItem('supporting decor or storage element', 'left side', 'midground', 'adds context without competing with the main subject'),
          makeLayoutItem('primary seating or product area', 'center', 'foreground/midground', 'dominant visual anchor'),
          makeLayoutItem('window, shelf, cabinet or accent object', 'right side', 'background/midground', 'balances the frame and completes the room story')
        ],
        foreground_to_background: [
          makeLayoutItem('floor texture and small foreground objects', 'foreground', 'near', 'shows scale and material quality'),
          makeLayoutItem('main furniture and styling objects', 'midground', 'middle distance', 'carries the prompt subject'),
          makeLayoutItem('architectural envelope and natural light source', 'background', 'far', 'creates depth and atmosphere')
        ]
      },
      all_subjects_and_objects: [
        {
          category: 'Interior furniture',
          item: title,
          quantity: 'primary scene group',
          shape: 'style-appropriate furniture silhouettes with believable proportions',
          structure: 'physically plausible seating, table, storage and decor arrangement',
          material: materials.join(', ') || 'brand-aligned interior materials',
          surface_state: 'clean, production-ready, high-end catalog finish',
          support_relationship: 'all furniture and decor must rest naturally on the floor, wall, ceiling or supporting surface',
          stress_state: 'stable, realistic, no floating or distorted objects'
        },
        {
          category: 'Architectural context',
          item: room,
          quantity: 'one coherent interior space',
          shape: 'clear room envelope with readable walls, floor and ceiling',
          material: 'painted surfaces, wood, stone, fabric or metal as required by the style',
          surface_state: 'clean, realistic, no visible text or watermark',
          support_relationship: 'architecture frames and supports the furniture composition'
        }
      ],
      light_and_color: {
        light_source_direction: 'soft natural window light supported by subtle interior fill light',
        light_intensity: 'balanced, commercial, not overexposed and not underexposed',
        color_temperature: 'neutral warm with style-appropriate accents',
        luminance_levels: 'soft highlight rolloff, clear midtones and readable shadow detail',
        contrast: 'moderate contrast with controlled material separation',
        saturation: 'low to medium saturation; avoid synthetic oversaturation',
        cmf_palette: cmf,
        material_keywords: materials,
        shadow_characteristics: 'soft, physically plausible contact shadows under furniture and decor'
      },
      details_and_imperfections: {
        seams_joints: 'show believable seams, joints and upholstery transitions only when useful',
        grain_noise: 'clean rendering with subtle photographic grain at most',
        stains_smudges: 'none unless explicitly requested',
        noise_artifacts: 'avoid AI artifacts, warped furniture, broken legs, duplicated objects and unreadable decorative text',
        out_of_focus: 'main furniture and room structure should remain sharp; background may be slightly softer',
        edge_sharpness_difference: 'stable edge quality across furniture, walls and decor'
      },
      background_and_environment: {
        indoor_outdoor: 'indoor residential or commercial-style room scene with optional window view',
        walls: 'clean wall planes or architectural surfaces aligned with the selected style',
        floor: 'realistic floor material with accurate perspective and contact shadows',
        ancillary_elements: ['lighting fixtures', 'storage or shelving', 'decor objects', 'plants when appropriate'],
        environmental_atmosphere: 'designed, usable, calm and commercially presentable'
      },
      generation_constraints: {
        text_logo_space_relationship: 'no visible text, brand logo, watermark or UI overlay inside the generated image',
        color_relationship: 'use the CMF palette as the color authority; accents should stay secondary',
        suspension_relationship: 'hanging lights, mobiles or wall decor must be physically supported',
        cropping_method: 'preserve the room function and the primary furniture silhouette',
        subject_proportion: 'furniture scale must remain realistic relative to windows, doors, rugs and tables',
        consistency_requirement: 'keep one dominant style language; avoid mixing unrelated interior styles'
      },
      prompt_text: {
        positive_prompt: positivePrompt,
        negative_prompt: negativePrompt
      }
    };

    return JSON.stringify(payload, null, 2);
  }

  function makeLayoutItem(element, position, level, purpose) {
    return {
      element: element,
      position: position,
      size: 'context-dependent',
      orientation: 'aligned to room perspective',
      level: level,
      distance: level,
      occlusion: 'natural partial overlaps only',
      overlap: 'avoid confusing overlaps',
      alignment: 'architecturally aligned',
      contact: purpose
    };
  }

  function getEnglishPromptTitle(entry) {
    if (ENGLISH_TITLES_BY_ID[entry.id]) return ENGLISH_TITLES_BY_ID[entry.id];

    const style = getStyleLabel(entry).replace(/ style$/i, '');
    const room = getRoomLabel(entry);
    const feature = getTitleFeature(entry.title || '');
    return titleCase([style, feature, room].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()) || 'Interior Scene Prompt';
  }

  function getTitleFeature(title) {
    for (const [pattern, label] of TITLE_RULES) {
      if (pattern.test(title) && !/^(open living-dining room|kitchen|dining room|study room|bedroom|entryway|living room)$/.test(label)) {
        return label;
      }
    }
    return '';
  }

  function getStyleLabel(entry) {
    return STYLE_LABELS[entry.styleId] || 'Photorealistic interior style';
  }

  function getRoomLabel(entry) {
    const source = String(entry.title || '') + ' ' + (entry.tags || []).join(' ');
    for (const [pattern, label] of TITLE_RULES) {
      if (pattern.test(source) && /room|kitchen|entryway|scene/.test(label)) return label;
    }
    return 'interior room';
  }

  function getMaterialLabels(entry) {
    const tags = entry.tags || [];
    const labels = [];
    TAG_RULES.forEach(([raw, label]) => {
      if (tags.includes(raw) && !labels.includes(label) && !/room|kitchen|entryway/.test(label)) {
        labels.push(label);
      }
    });
    if (!labels.length) {
      const cmfColors = getCmfPalette(entry);
      if (cmfColors.base_colors.length) labels.push('CMF-guided surfaces');
    }
    return labels;
  }

  function getEnglishPositivePrompt(entry, title, style, room, materials) {
    const candidate = entry.imagePrompt || entry.prompt || '';
    if (candidate && !/[\u3400-\u9FFF]/.test(candidate)) {
      return candidate;
    }

    const materialText = materials.length ? materials.join(', ') + ' materials' : 'style-appropriate furniture materials';
    return [
      'Photorealistic ' + room + ' interior design scene',
      title,
      style,
      materialText,
      'realistic furniture scale and clean spatial hierarchy',
      'soft natural window light with controlled commercial fill lighting',
      'brand-aligned CMF palette, accurate textures, realistic contact shadows',
      'high-end home catalog composition, no people, no text, no watermark'
    ].join(', ');
  }

  function titleCase(value) {
    return value
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
      return FALLBACK_CMF[entry.styleId] || FALLBACK_CMF['interior-reference'];
    }
    const palette = {
      base_colors: extractHexCodes(style.cmf.baseColors),
      accent_colors: extractHexCodes(style.cmf.accentColors)
    };
    if (!palette.base_colors.length && !palette.accent_colors.length) {
      return FALLBACK_CMF[entry.styleId] || FALLBACK_CMF['interior-reference'];
    }
    return palette;
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

  function initPluginDemoMagnetism() {
    const card = document.querySelector('.prompt-plugin-demo-wrap');
    if (!card) return;
    const target = card.querySelector('.prompt-plugin-demo-gif') || card;

    let tiltX = 0;
    let tiltY = 0;
    let magX = 0;
    let magY = 0;
    let animRaf;
    const lerp = (a, b, n) => (1 - n) * a + n * b;

    function applyTransform() {
      target.style.transform = [
        'perspective(1200px)',
        `rotateX(${tiltX.toFixed(2)}deg)`,
        `rotateY(${tiltY.toFixed(2)}deg)`,
        `translate(${magX.toFixed(2)}px,${magY.toFixed(2)}px)`
      ].join(' ');
    }

    const releaseRiseAnimation = () => {
      card.style.animation = 'none';
    };
    card.addEventListener('animationend', releaseRiseAnimation, { once: true });
    window.setTimeout(releaseRiseAnimation, 3600);

    card.addEventListener('mousemove', event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      tiltX = ((y - cy) / cy) * -6;
      tiltY = ((x - cx) / cx) * 6;
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
          tiltX = 0;
          tiltY = 0;
          magX = 0;
          magY = 0;
          target.style.transform = '';
        }
      }

      cancelAnimationFrame(animRaf);
      springBack();
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
