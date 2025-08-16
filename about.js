// about.js — gleichmäßig verteilter Scroll-Fortschritt für 4 Kacheln
// Down: kumulativ aktivieren, Up: wieder deaktivieren (nur Mobile/Touch)
(function () {
  // Nur auf der About-Seite laufen (optional einkommentieren, wenn du die Body-Klasse sicher hast)
  // if (!document.body.classList.contains('about')) return;

  const SELECTOR = '.about-gallery .person'; // 4 Figuren in einer Reihe
  const OFFSET = 0; // 0 = pro Abschnitt genau eine weitere Kachel

  // Nur Mobile/Touch (Desktop behält :hover)
  const mm = window.matchMedia('(hover: none) and (pointer: coarse)');
  const looksLikeTouch = mm.matches || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  if (!looksLikeTouch) return;

  const tiles = Array.from(document.querySelectorAll(SELECTOR));
  if (!tiles.length) return;

  let maxActivatedDown = 0;   // höchster Stand beim Runterscrollen
  let lastScrollTop = getScrollTop();

  function getScrollTop() {
    const doc = document.documentElement;
    const body = document.body;
    return window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
  }

  function getProgressCount() {
    const doc = document.documentElement;
    const body = document.body;

    const scrollTop = getScrollTop();
    const clientH   = window.innerHeight || doc.clientHeight || 0;

    // robuste Gesamthöhe
    const scrollH = Math.max(
      body.scrollHeight, doc.scrollHeight,
      body.offsetHeight, doc.offsetHeight,
      body.clientHeight, doc.clientHeight
    );

    const maxScroll = Math.max(1, scrollH - clientH);
    let p = scrollTop / maxScroll; // 0..1
    if (p < 0) p = 0;
    if (p > 1) p = 1;

    // N Abschnitte → bei p >= k/N wird die k-te Kachel aktiviert (1-basiert)
    let count = Math.floor(p * tiles.length) + OFFSET; // 0..N
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
      // Beim Runterscrollen nie weniger aktiv als bisher
      if (progressCount > maxActivatedDown) maxActivatedDown = progressCount;
      activeCount = maxActivatedDown;
    } else {
      // Beim Hochscrollen nach Position zurücknehmen
      activeCount = Math.min(progressCount, maxActivatedDown);
    }

    applyActive(activeCount);
    lastScrollTop = currentTop;
  }

  // rAF-Throttle
  let ticking = false;
  function onScrollResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateFromScroll();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScrollResize, { passive: true });
  window.addEventListener('resize', onScrollResize, { passive: true });
  window.addEventListener('orientationchange', onScrollResize);

  // Initial
  updateFromScroll();
})();
