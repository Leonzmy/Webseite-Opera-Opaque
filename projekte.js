// projekte.js — 10%-Scroll -> genau eine Kachel aktiv
(function () {
  const SELECTOR = '.projekte-grid--2x2 a';

  // Nur Mobile/Touch (Desktop behält Hover)
  const mm = window.matchMedia('(hover: none) and (pointer: coarse)');
  const looksLikeTouch = mm.matches || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  if (!looksLikeTouch) return;

  const tiles = Array.from(document.querySelectorAll(SELECTOR));
  if (!tiles.length) return;

  // Config
  const STEP_PERCENT = 10;   // pro 10 % Scroll ein Schritt
  const START_AT = 10;       // ab 10 % startet Kachel 1

  function setActiveIndex(idx) {
    // idx: 0 = keine aktiv, 1 = erste Kachel, 2 = zweite, ...
    tiles.forEach((el, i) => {
      el.classList.toggle('inview', i === (idx - 1));
    });
  }

  function updateFromScroll() {
    const doc = document.documentElement;
    const body = document.body;

    const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
    const clientH = window.innerHeight || doc.clientHeight || 0;
    const scrollH = Math.max(
      body.scrollHeight, doc.scrollHeight,
      body.offsetHeight, doc.offsetHeight,
      body.clientHeight, doc.clientHeight
    );

    const maxScroll = Math.max(1, scrollH - clientH); // Schutz vor /0
    const pct = (scrollTop / maxScroll) * 100;        // 0..100

    // Schrittberechnung:
    // 0–9% -> stepRaw=0 => idx=0 (keine)
    // 10–19% -> stepRaw=1 => idx=1 (erste) ...
    const stepRaw = Math.floor((pct - (START_AT - STEP_PERCENT)) / STEP_PERCENT);
    let idx = stepRaw; // 0..∞

    // Begrenzen: 0..tiles.length
    if (idx < 0) idx = 0;
    if (idx > tiles.length) idx = tiles.length;

    // Genau eine Kachel aktiv (oder keine, wenn idx=0)
    setActiveIndex(idx);
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
