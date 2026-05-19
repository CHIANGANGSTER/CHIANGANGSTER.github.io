/* Injects the shared knowledge-base navigation. */
(() => {
  const host = document.querySelector('[data-include="nav"]');
  if (!host) return;

  const links = [
    ['/?home=archive', 'Home'],
    ['/workflows/', '工作流 WORKFLOWS'],
    ['/prompts/', 'Prompt 库 PROMPTS'],
    ['/research/', '调研 RESEARCH'],
    ['/marketing/', '营销 MARKETING'],
    ['/resources/', '资源 RESOURCES']
  ];
  const path = location.pathname;
  const active = href => {
    const cleanHref = href.split('?')[0];
    return cleanHref === '/' ? path === '/' || path.endsWith('/index.html') : path.startsWith(cleanHref);
  };

  host.innerHTML = `
    <nav class="kb-nav" aria-label="Primary">
      <div class="kb-nav__inner">
        <a class="kb-nav__brand" href="/?home=archive">CHIANGANGSTER</a>
        <div class="kb-nav__links">
          ${links.map(([href, label]) => `<a href="${href}"${active(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
          <button class="kb-nav__search" type="button" aria-label="打开搜索" aria-haspopup="dialog" aria-expanded="false">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
            搜索
          </button>
          <a href="/about/">关于 ABOUT</a>
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
