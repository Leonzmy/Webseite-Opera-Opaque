// about.js — 4 Kacheln: runter = kumulativ aktivieren, hoch = zurücknehmen
(function () {
  const SELECTOR = '.fullwidth-gallery .person';
  const FORCE_ENABLE = false; // zum Desktop-Testen auf true setzen

  // Nur Mobile/Touch (oder FORCE)
  const mm = window.matchMedia('(hover: none) and (pointer: coarse)');
  const looksLikeTouch = mm.matches || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  if (!looksLikeTouch && !FORCE_ENABLE) { console.debug('[about.js] skip (kein Touch)'); return; }

  const tiles = Array.from(document.querySelectorAll(SELECTOR));
  console.debug('[about.js] tiles gefunden:', tiles.length);
  if (!tiles.length) return;

  let maxActivatedDown = 0;
  let lastScrollTop = getScrollTop();

  function getScrollTop() {
    const d = document.documentElement, b = document.body;
    return window.pageYOffset || d.scrollTop || b.scrollTop || 0;
  }

  function getProgressCount() {
    const d = document.documentElement, b = document.body;
    const scrollTop = getScrollTop();
    const clientH   = window.innerHeight || d.clientHeight || 0;
    const scrollH   = Math.max(b.scrollHeight, d.scrollHeight, b.offsetHeight, d.offsetHeight, b.clientHeight, d.clientHeight);
    const maxScroll = Math.max(1, scrollH - clientH);
    const p = Math.min(1, Math.max(0, scrollTop / maxScroll)); // 0..1
    return Math.floor(p * tiles.length); // 0..N (N=4)
  }

  function applyActive(count) {
    tiles.forEach((el, i) => el.classList.toggle('inview', i < count));
  }

  function updateFromScroll() {
    const currentTop = getScrollTop();
    const scrollingDown = currentTop > lastScrollTop;
    const progressCount = getProgressCount();

    let activeCount;
    if (scrollingDown) {
      if (progressCount > maxActivatedDown) maxActivatedDown = progressCount; // kumulativ
      activeCount = maxActivatedDown;
    } else {
      activeCount = Math.min(progressCount, maxActivatedDown); // hoch: zurücknehmen
    }
    applyActive(activeCount);
    lastScrollTop = currentTop;
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
  console.debug('[about.js] aktiv');
})();
