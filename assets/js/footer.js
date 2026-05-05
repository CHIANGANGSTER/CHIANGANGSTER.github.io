/* Injects the shared footer. */
(() => {
  const BUILD_DATE = '2026-04-28';
  const host = document.querySelector('[data-include="footer"]');
  if (!host) return;
  host.innerHTML = `
    <footer class="kb-footer">
      <div class="kb-footer__inner">
        <span>CHIANGANGSTER AI Knowledge Base</span>
        <span>Updated ${BUILD_DATE} · <a href="/docs/adding-an-entry.md">Add an entry</a></span>
      </div>
    </footer>
  `;
})();
