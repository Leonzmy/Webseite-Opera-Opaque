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

  // --- Gecachte Maße: nur bei Load/Resize neu berechnen, NICHT bei jedem
  // Scroll-Frame — verhindert Ruckeln durch die mobile Adressleiste,
  // die window.innerHeight während des Scrollens laufend ändert. ---
  let cachedMaxScroll = 1;

  function getScrollTop() {
    const d = document.documentElement, b = document.body;
    return window.pageYOffset || d.scrollTop || b.scrollTop || 0;
  }

  function recalcMaxScroll() {
    const d = document.documentElement, b = document.body;
    const clientH = window.innerHeight || d.clientHeight || 0;
    const scrollH = Math.max(
      b.scrollHeight, d.scrollHeight,
      b.offsetHeight, d.offsetHeight,
      b.clientHeight, d.clientHeight
    );
    cachedMaxScroll = Math.max(1, scrollH - clientH);
  }

  function getProgressCount() {
    const scrollTop = getScrollTop();
    const p = Math.min(1, Math.max(0, scrollTop / cachedMaxScroll)); // 0..1

    // --- Startversatz: erst ab 10% beginnen ---
    const START_OFFSET = 0.1; // = 10%, passe an (0.2 = 20% usw.)
    if (p < START_OFFSET) {
      return 0; // noch nichts aktiv
    }
    const effectiveP = (p - START_OFFSET) / (1 - START_OFFSET); // 0..1
    let count = Math.round(effectiveP * tiles.length);
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

  // rAF-Throttle für Scroll
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateFromScroll(); ticking = false; });
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

  recalcMaxScroll();
  updateFromScroll();

  // Nachmessen, sobald wirklich alles geladen ist (Bilder, Web-Fonts) —
  // vorher gemessene Werte können durch nachträgliche Layout-Verschiebungen
  // (z.B. Web-Font-Reflow) zu klein/groß sein.
  window.addEventListener('load', () => {
    recalcMaxScroll();
    updateFromScroll();
  }, { once: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      recalcMaxScroll();
      updateFromScroll();
    });
  }
})();
