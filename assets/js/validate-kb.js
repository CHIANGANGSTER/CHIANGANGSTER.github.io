/* Dev-only kb.json schema validator. */
(() => {
  const host = location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') return;

  const REQUIRED = ['id', 'title', 'domain', 'type', 'tags', 'status', 'owner', 'updated', 'summary', 'url'];
  const STATUSES = new Set(['published', 'testing', 'planned', 'archived']);
  const DOMAINS = new Set(['workflows', 'prompts', 'research', 'marketing', 'resources']);

  Promise.all([
    fetch('/assets/data/kb.json').then(r => r.json()),
    fetch('/assets/data/tags.json').then(r => r.json())
  ]).then(([kb, tags]) => {
    const tagIds = new Set((tags.tags || []).map(t => t.id));
    const seenIds = new Set();
    let warnings = 0;

    (kb.entries || []).forEach((entry, index) => {
      const id = entry.id || `(entry #${index})`;
      REQUIRED.forEach(field => {
        const value = entry[field];
        if (value === undefined || value === null || value === '' || (field === 'tags' && (!Array.isArray(value) || value.length === 0))) {
          warn(id, `missing required field "${field}"`);
        }
      });
      if (entry.id) {
        if (seenIds.has(entry.id)) warn(id, 'duplicate id');
        seenIds.add(entry.id);
      }
      if (entry.domain && !DOMAINS.has(entry.domain)) warn(id, `unknown domain "${entry.domain}"`);
      if (entry.status && !STATUSES.has(entry.status)) warn(id, `unknown status "${entry.status}"`);
      (entry.tags || []).forEach(tag => {
        if (!tagIds.has(tag)) warn(id, `tag "${tag}" not in tags.json`);
      });
      if (entry.url && entry.url !== '#' && entry.external !== true) {
        const expectedUrls = [
          `/${entry.domain}/${entry.id}/`,
          `/${entry.domain}/${entry.id}/index.html`,
          `/${entry.domain}/${entry.id}.html`
        ];
        if (!expectedUrls.includes(entry.url)) {
          warn(id, `url "${entry.url}" does not match ${expectedUrls.join(' or ')}`);
        }
      }
    });

    if (warnings === 0) console.info('[validate-kb] OK - kb.json passed all checks.');
    function warn(id, message) {
      warnings += 1;
      console.warn(`[validate-kb] ${id}: ${message}`);
    }
  }).catch(error => console.error('[validate-kb] failed to load:', error));
})();
