// about.js — 4 Kacheln: beim Runter-Scrollen nach und nach aktivieren,
// beim Hoch-Scrollen entsprechend zurücknehmen (immer synchron zum Fortschritt)
(function () {
  const SELECTOR = '.fullwidth-gallery .person';

  // Touch-Erkennung + Body-Flag setzen
  const isTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
                  window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) return;
  document.body.classList.add('touch');

  const tiles = Array.from(document.querySelectorAll(SELECTOR));
  if (!tiles.length) return;

  function getScrollTop() {
    const d = document.documentElement, b = document.body;
    return window.pageYOffset || d.scrollTop || b.scrollTop || 0;
  }
  function getProgressCount() {
    const d = document.documentElement, b = document.body;
    const scrollTop = getScrollTop();
    const clientH   = window.innerHeight || d.clientHeight || 0;
    const scrollH   = Math.max(
      b.scrollHeight, d.scrollHeight,
      b.offsetHeight, d.offsetHeight,
      b.clientHeight, d.clientHeight
    );
    const maxScroll = Math.max(1, scrollH - clientH);
    const p = Math.min(1, Math.max(0, scrollTop / maxScroll)); // 0..1

    // --- Startversatz: erst ab 10% beginnen ---
    const START_OFFSET = 0.1; // = 10%, passe an (0.2 = 20% usw.)

    if (p < START_OFFSET) {
      return 0; // noch nichts aktiv
    }

    // Reststrecke (ab Offset bis 100%) gleichmäßig auf Kacheln verteilen
    const effectiveP = (p - START_OFFSET) / (1 - START_OFFSET); // 0..1
    let count = Math.floor(effectiveP * tiles.length);

    if (count < 0) count = 0;
    if (count > tiles.length) count = tiles.length;
    return count;
  }

  function applyActive(count) {
    tiles.forEach((el, i) => el.classList.toggle('inview', i < count));
  }
  function updateFromScroll() {
    const progressCount = getProgressCount();
    applyActive(progressCount);
  }

  let ticking = false;
  function onScrollResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateFromScroll(); ticking = false; });
  }

  window.addEventListener('scroll', onScrollResize, { passive: true });
  window.addEventListener('resize', onScrollResize, { passive: true });
  window.addEventListener('orientationchange', onScrollResize);

  updateFromScroll();
})();

