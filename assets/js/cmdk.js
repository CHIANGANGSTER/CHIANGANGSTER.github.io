/* Cmd/Ctrl+K and slash-triggered KB search modal. */
(() => {
  let modal;
  let input;
  let list;
  let lastFocus;
  let isOpen = false;
  let entries = [];
  let tagsById = {};

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
      return;
    }
    const [kb, tags] = await Promise.all([
      fetch('/assets/data/kb.json').then(r => r.json()),
      fetch('/assets/data/tags.json').then(r => r.json())
    ]);
    entries = kb.entries || [];
    tagsById = Object.fromEntries((tags.tags || []).map(tag => [tag.id, tag]));
    window.__kbIndex = { entries, tagsById };
  }

  async function open(trigger) {
    ensureModal();
    lastFocus = trigger || document.activeElement;
    await loadIndex();
    input.value = '';
    render('');
    modal.hidden = false;
    isOpen = true;
    input.focus();
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
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
})();
