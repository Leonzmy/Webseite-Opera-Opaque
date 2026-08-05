// projekte.js — gleichmäßig verteilter Scroll-Fortschritt
// Down: kumulativ aktivieren, Up: wieder deaktivieren
(function () {
  const SELECTOR = '.projekte-grid--2x2 a';
  const OFFSET = 0; // 0 = pro Abschnitt genau eine weitere Kachel

  // Nur Mobile/Touch (Desktop behält :hover)
  const mm = window.matchMedia('(hover: none) and (pointer: coarse)');
  const looksLikeTouch = mm.matches || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  if (!looksLikeTouch) return;

  const tiles = Array.from(document.querySelectorAll(SELECTOR));
  if (!tiles.length) return;

  let maxActivatedDown = 0;   // bisher höchster Stand beim Runterscrollen
  let lastScrollTop = getScrollTop();

  // --- Gecachte Maße: nur bei Load/Resize neu berechnen, NICHT bei jedem
  // Scroll-Frame — verhindert Ruckeln durch die mobile Adressleiste,
  // die window.innerHeight während des Scrollens laufend ändert. ---
  let cachedMaxScroll = 1;

  function getScrollTop() {
    const doc = document.documentElement;
    const body = document.body;
    return window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
  }

  function recalcMaxScroll() {
    const doc = document.documentElement;
    const body = document.body;
    const clientH = window.innerHeight || doc.clientHeight || 0;
    const scrollH = Math.max(
      body.scrollHeight, doc.scrollHeight,
      body.offsetHeight, doc.offsetHeight,
      body.clientHeight, doc.clientHeight
    );
    cachedMaxScroll = Math.max(1, scrollH - clientH);
  }

  function getProgressCount() {
    const scrollTop = getScrollTop();
    let p = scrollTop / cachedMaxScroll; // 0..1
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    let count = Math.round(p * tiles.length) + OFFSET; // 0..N
    if (count < 0) count = 0;
    if (count > tiles.length) count = tiles.length;
    return count;
  }

  function applyActive(count) {
    tiles.forEach((el, i) => {
      el.classList.toggle('inview', i < count);
    });
  }

  function updateFromScroll() {
    const currentTop = getScrollTop();
    const scrollingDown = currentTop > lastScrollTop;
    const progressCount = getProgressCount();
    let activeCount;
    if (scrollingDown) {
      if (progressCount > maxActivatedDown) maxActivatedDown = progressCount;
      activeCount = maxActivatedDown;
    } else {
      activeCount = Math.min(progressCount, maxActivatedDown);
    }
    applyActive(activeCount);
    lastScrollTop = currentTop;
  }

  // rAF-Throttle für Scroll
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateFromScroll();
      ticking = false;
    });
  }

  // Resize/Orientation: Maße neu berechnen (debounced), dann einmal aktualisieren
  let resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      recalcMaxScroll();
      updateFromScroll();
    }, 150);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize);

  // Initial
  recalcMaxScroll();
  updateFromScroll();
})();
