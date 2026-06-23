/* Injects the legacy knowledge-base navigation include. */
(() => {
  const host = document.querySelector('[data-include="nav"]');
  if (!host) return;

  const links = [
    ['/?home=hero', 'HOME 主页'],
    ['/workflows/', 'WORKFLOWS 工作流'],
    ['/prompts/', 'PROMPTS 提示词'],
    ['/research/', 'RESEARCH 研究'],
    ['/marketing/', 'MARKETING 营销'],
    ['/resources/', 'RESOURCES 资源']
  ];
  const path = location.pathname;
  const active = href => {
    const cleanHref = href.split('?')[0];
    return cleanHref === '/' ? path === '/' || path.endsWith('/index.html') : path.startsWith(cleanHref);
  };

  host.innerHTML = `
    <nav class="kb-nav" aria-label="Primary">
      <div class="kb-nav__inner">
        <div class="kb-nav__links" style="margin-left:0">
          ${links.map(([href, label]) => `<a href="${href}"${active(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
          <button class="kb-nav__search" type="button" aria-label="Open search" aria-haspopup="dialog" aria-expanded="false">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
            Search
          </button>
        </div>
      </div>
    </nav>
  `;

  const button = host.querySelector('.kb-nav__search');
  button?.addEventListener('click', () => {
    button.setAttribute('aria-expanded', 'true');
    window.dispatchEvent(new CustomEvent('cmdk:open', { detail: { trigger: button } }));
  });
  window.addEventListener('cmdk:closed', () => button?.setAttribute('aria-expanded', 'false'));
  window.dispatchEvent(new CustomEvent('kb:navigation-ready'));
})();