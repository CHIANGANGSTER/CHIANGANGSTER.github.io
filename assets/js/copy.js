/* Adds copy buttons to copyable code blocks. */
(() => {
  document.querySelectorAll('pre[data-copyable]').forEach(pre => {
    if (pre.querySelector('.copy-button')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.addEventListener('click', async () => {
      const text = pre.innerText.replace(/^Copy\s*/, '');
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = 'Copy'; }, 2000);
    });
    pre.appendChild(button);
  });
})();
