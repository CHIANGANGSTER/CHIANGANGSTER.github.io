/* Updates a reading progress bar when present. */
(() => {
  const bar = document.querySelector('.progress-bar');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    bar.style.width = `${pct * 100}%`;
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();
