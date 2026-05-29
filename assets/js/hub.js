/* Fetches kb.json, filters by domain, and renders hub cards. */
(() => {
  const escapeHtml = window.AppUtils.escapeHtml;
  const root = document.querySelector('[data-hub-domain]');
  if (!root) return;

  const domain = root.dataset.hubDomain;
  const grid = root.querySelector('[data-hub-grid]');
  const empty = root.querySelector('[data-hub-empty]');
  const count = root.querySelector('[data-hub-count]');
  const statusRow = root.querySelector('[data-status-filters]');
  const tagRow = root.querySelector('[data-tag-filters]');

  const state = { status: 'all', tags: new Set() };
  let entries = [];
  let tagsById = {};
  let statusBound = false;
  let tagBound = false;

  Promise.all([
    fetch('/assets/data/kb.json').then(r => r.json()),
    fetch('/assets/data/tags.json').then(r => r.json())
  ]).then(([kb, tags]) => {
    tagsById = Object.fromEntries((tags.tags || []).map(tag => [tag.id, tag]));
    entries = (kb.entries || []).filter(entry => entry.domain === domain);
    renderFilters();
    renderCards();
  }).catch(error => {
    console.error('[hub] failed to load:', error);
    if (empty) {
      empty.textContent = '内容加载失败，请稍后重试。';
      empty.classList.add('is-visible');
    }
  });

  function renderFilters() {
    if (statusRow) {
      const statuses = [
        ['all', '全部'],
        ['published', '已发布'],
        ['testing', '测试中'],
        ['planned', '计划中']
      ];
      statusRow.innerHTML = statuses.map(([value, label]) =>
        `<button class="hub-filter" type="button" data-status="${value}" aria-pressed="${value === state.status}">${label}</button>`
      ).join('');
      if (!statusBound) {
        statusBound = true;
        statusRow.addEventListener('click', event => {
          const button = event.target.closest('[data-status]');
          if (!button) return;
          state.status = button.dataset.status;
          renderFilters();
          renderCards();
        });
      }
    }

    if (tagRow) {
      const ids = [...new Set(entries.flatMap(entry => entry.tags || []))];
      tagRow.innerHTML = ids.map(id => {
        const meta = tagsById[id] || { label: id, hint: '' };
        const pressed = state.tags.has(id);
        return `<button class="hub-filter" type="button" data-tag-id="${escapeHtml(id)}" data-hint="${escapeHtml(meta.hint || '')}" aria-pressed="${pressed}">${escapeHtml(meta.label || id)}</button>`;
      }).join('');
      if (!tagBound) {
        tagBound = true;
        tagRow.addEventListener('click', event => {
          const button = event.target.closest('[data-tag-id]');
          if (!button) return;
          const id = button.dataset.tagId;
          if (state.tags.has(id)) state.tags.delete(id);
          else state.tags.add(id);
          renderFilters();
          renderCards();
        });
      }
    }
  }

  function renderCards() {
    const visible = entries.filter(entry => {
      const statusOk = state.status === 'all' || entry.status === state.status;
      const tagsOk = state.tags.size === 0 || [...state.tags].some(tag => (entry.tags || []).includes(tag));
      return statusOk && tagsOk;
    });
    if (count) count.textContent = `${visible.length} / ${entries.length} entries`;
    if (empty) empty.classList.toggle('is-visible', visible.length === 0);
    if (!grid) return;
    grid.innerHTML = visible.map(cardHtml).join('');
    scheduleCardRise();
  }

  function scheduleCardRise() {
    if (!grid) return;
    const reveal = window.KBReveal || window.KBRevealMotion;
    // Animation class/styles come from the shared reveal-motion module; the hub
    // only owns the delay so cards rise after the hero line-reveal finishes.
    reveal?.revealCards?.('.kb-card', { root: grid, delay: 1080 });
  }

  function cardHtml(entry) {
    const navigable = entry.url && entry.url !== '#' && entry.status !== 'planned' && entry.status !== 'archived';
    const tagHtml = (entry.tags || []).map(id => {
      const meta = tagsById[id] || { label: id, hint: '' };
      return `<span class="kb-chip" data-tag-id="${escapeHtml(id)}" data-hint="${escapeHtml(meta.hint || '')}">${escapeHtml(meta.label || id)}</span>`;
    }).join('');
    const statusText = statusLabel(entry.status);
    const metaText = domain === 'workflows'
      ? escapeHtml(entry.updated || '')
      : `${escapeHtml(entry.owner || '')} · ${escapeHtml(entry.updated || '')}`;
    const inner = `
      <div class="kb-card__eyebrow">
        <span>${escapeHtml(entry.type || 'entry')}</span>
      </div>
      <h2>${escapeHtml(entry.title)}</h2>
      <p>${escapeHtml(entry.summary)}</p>
      <div class="kb-card__tags">${tagHtml}</div>
      <div class="kb-card__meta">
        <span class="kb-status" data-status="${escapeHtml(entry.status)}">${statusText}</span>
        <span>${metaText}</span>
      </div>
    `;
    if (navigable) {
      return `<a class="kb-card card-rise" data-card-reveal-ready="true" data-status="${escapeHtml(entry.status)}" href="${escapeHtml(entry.url)}" aria-label="${escapeHtml(entry.title)} - ${statusText}">${inner}</a>`;
    }
    return `<div class="kb-card card-rise" data-card-reveal-ready="true" data-status="${escapeHtml(entry.status)}" role="article" aria-label="${escapeHtml(entry.title)} - ${statusText}">${inner}</div>`;
  }

  function statusLabel(status) {
    return ({ published: '已发布', testing: '测试中', planned: '待发布', archived: '已归档' })[status] || status;
  }

})();
