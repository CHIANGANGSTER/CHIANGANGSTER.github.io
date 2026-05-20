/* Static GradualBlur navigation layer based on React Bits. */
(() => {
  const CONFIG = {
    position: 'top',
    height: '7rem',
    strength: 1.5,
    divCount: 5,
    curve: 'bezier',
    exponential: true,
    opacity: 1
  };

  const CURVE_FUNCTIONS = {
    linear: p => p,
    bezier: p => p * p * (3 - 2 * p),
    'ease-in': p => p * p,
    'ease-out': p => 1 - Math.pow(1 - p, 2),
    'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
  };

  const getGradientDirection = position => ({
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right'
  })[position] || 'to bottom';

  function createGradualBlur() {
    const root = document.createElement('div');
    root.className = 'gradual-blur gradual-blur-parent';
    root.setAttribute('aria-hidden', 'true');
    root.style.height = CONFIG.height;

    const inner = document.createElement('div');
    inner.className = 'gradual-blur-inner';
    root.appendChild(inner);

    const increment = 100 / CONFIG.divCount;
    const curveFunc = CURVE_FUNCTIONS[CONFIG.curve] || CURVE_FUNCTIONS.linear;
    const direction = getGradientDirection(CONFIG.position);

    for (let i = 1; i <= CONFIG.divCount; i += 1) {
      let progress = curveFunc(i / CONFIG.divCount);
      const blurValue = CONFIG.exponential
        ? Math.pow(2, progress * 4) * 0.0625 * CONFIG.strength
        : 0.0625 * (progress * CONFIG.divCount + 1) * CONFIG.strength;

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const layer = document.createElement('div');
      layer.style.maskImage = `linear-gradient(${direction}, ${gradient})`;
      layer.style.webkitMaskImage = `linear-gradient(${direction}, ${gradient})`;
      layer.style.backdropFilter = `blur(${blurValue.toFixed(3)}rem)`;
      layer.style.webkitBackdropFilter = `blur(${blurValue.toFixed(3)}rem)`;
      layer.style.opacity = CONFIG.opacity;
      inner.appendChild(layer);
    }

    return root;
  }

  function applyGradualBlur() {
    document.querySelectorAll('.kb-nav, .glass-page-nav, .prompt-nav, .nav').forEach(nav => {
      if (nav.querySelector(':scope > .gradual-blur')) return;
      nav.classList.add('gradual-blur-host');
      nav.prepend(createGradualBlur());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGradualBlur, { once: true });
  } else {
    applyGradualBlur();
  }
  window.addEventListener('kb:navigation-ready', applyGradualBlur);
})();

/* Cmd/Ctrl+K and slash-triggered KB search modal. */
(() => {
  const escapeHtml = window.AppUtils.escapeHtml;
  let modal;
  let input;
  let list;
  let lastFocus;
  let isOpen = false;
  let entries = [];
  let tagsById = {};
  let indexLoadError = null;

  function ensureModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'cmdk-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', '全站搜索');
    modal.innerHTML = `
      <div class="cmdk-backdrop" data-cmdk-close></div>
      <section class="cmdk-panel">
        <input class="cmdk-input" type="search" aria-label="搜索知识库" placeholder="搜索工作流、Prompt、模板…  ⌘K">
        <ul class="cmdk-list" role="listbox"></ul>
        <p class="cmdk-hint">↑↓ 选择 · ↵ 打开 · esc 关闭</p>
      </section>
    `;
    document.body.appendChild(modal);
    input = modal.querySelector('.cmdk-input');
    list = modal.querySelector('.cmdk-list');
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', onInputKey);
    list.addEventListener('click', onListClick);
    modal.addEventListener('click', event => {
      if (event.target.matches('[data-cmdk-close]')) close();
    });
  }

  async function loadIndex() {
    if (window.__kbIndex) {
      entries = window.__kbIndex.entries;
      tagsById = window.__kbIndex.tagsById;
      indexLoadError = null;
      return;
    }
    const [kb, tags] = await Promise.all([
      loadJson('/assets/data/kb.json'),
      loadJson('/assets/data/tags.json')
    ]);
    entries = kb.entries || [];
    tagsById = Object.fromEntries((tags.tags || []).map(tag => [tag.id, tag]));
    window.__kbIndex = { entries, tagsById };
    indexLoadError = null;
  }

  async function open(trigger) {
    ensureModal();
    lastFocus = trigger || document.activeElement;
    input.value = '';
    try {
      await loadIndex();
      render('');
    } catch (error) {
      console.error('[cmdk] failed to load search data:', error);
      entries = [];
      tagsById = {};
      indexLoadError = error;
      renderLoadError();
    }
    modal.hidden = false;
    isOpen = true;
    input.focus();
  }

  async function loadJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.json();
  }

  function renderLoadError() {
    list.innerHTML = '<li class="cmdk-empty">搜索数据加载失败，请刷新页面或检查本地服务器。</li>';
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    isOpen = false;
    window.dispatchEvent(new CustomEvent('cmdk:closed'));
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function results(query) {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return [...entries].sort((a, b) => String(b.updated).localeCompare(String(a.updated))).slice(0, 8);
    }
    return entries
      .map(entry => ({ entry, score: score(entry, tokens) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.entry);
  }

  function score(entry, tokens) {
    const title = String(entry.title || '').toLowerCase();
    const tags = (entry.tags || []).join(' ').toLowerCase();
    const summary = String(entry.summary || '').toLowerCase();
    return tokens.reduce((sum, token) => {
      return sum + (title.includes(token) ? 3 : 0) + (tags.includes(token) ? 2 : 0) + (summary.includes(token) ? 1 : 0);
    }, 0);
  }

  function render(query) {
    if (indexLoadError) {
      renderLoadError();
      return;
    }
    const rows = results(query);
    list.innerHTML = '';
    if (rows.length === 0) {
      list.innerHTML = '<li class="cmdk-empty">没有匹配。</li>';
      return;
    }
    let selected = false;
    rows.forEach(entry => {
      const navigable = Boolean(entry.url && entry.url !== '#');
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.dataset.url = entry.url || '';
      if (!navigable) {
        li.setAttribute('aria-disabled', 'true');
        li.tabIndex = -1;
        li.classList.add('is-disabled');
      } else if (!selected) {
        li.setAttribute('aria-selected', 'true');
        selected = true;
      } else {
        li.setAttribute('aria-selected', 'false');
      }
      const trail = navigable ? '' : ' · 即将上线';
      const tagHtml = (entry.tags || []).slice(0, 3).map(id => {
        const meta = tagsById[id] || { label: id };
        return `<span class="cmdk-chip">${escapeHtml(meta.label || id)}</span>`;
      }).join('');
      li.innerHTML = `
        <span class="cmdk-row">
          <span class="cmdk-title">${escapeHtml(entry.title)}${trail}</span>
          <span class="cmdk-meta">${escapeHtml(entry.domain)} · ${statusLabel(entry.status)}</span>
        </span>
        <span class="cmdk-tags">${tagHtml}</span>
      `;
      list.appendChild(li);
    });
  }

  function moveSelection(delta) {
    const items = [...list.querySelectorAll('li[role="option"]:not(.is-disabled)')];
    if (items.length === 0) return;
    const current = items.findIndex(li => li.getAttribute('aria-selected') === 'true');
    items.forEach(li => li.setAttribute('aria-selected', 'false'));
    const next = items[(current + delta + items.length) % items.length];
    next.setAttribute('aria-selected', 'true');
    next.scrollIntoView({ block: 'nearest' });
  }

  function activateSelected() {
    const selected = list.querySelector('li[aria-selected="true"]');
    if (!selected) return;
    const url = selected.dataset.url;
    if (!url || url === '#') return;
    location.assign(url);
  }

  function onInputKey(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveSelection(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveSelection(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      activateSelected();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  function onListClick(event) {
    const row = event.target.closest('li[role="option"]');
    if (!row || row.classList.contains('is-disabled')) return;
    const url = row.dataset.url;
    if (!url || url === '#') return;
    location.assign(url);
  }

  function isTypingTarget(element) {
    if (!element) return false;
    return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable;
  }

  window.addEventListener('keydown', event => {
    if (isOpen) return;
    if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.code === 'KeyK')) {
      if (isTypingTarget(document.activeElement)) return;
      event.preventDefault();
      open(document.activeElement);
    } else if (event.key === '/') {
      if (isTypingTarget(document.activeElement)) return;
      event.preventDefault();
      open(document.activeElement);
    }
  });
  window.addEventListener('keydown', event => {
    if (isOpen && event.key === 'Escape') close();
  });
  window.addEventListener('cmdk:open', event => open(event.detail?.trigger));

  function statusLabel(status) {
    return ({ published: '已发布', testing: '测试中', planned: '计划中', archived: '已归档' })[status] || status;
  }
})();
