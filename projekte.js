// projekte.js — mobile in-view swap (ohne Debug)
(function () {
  const SELECTOR = '.projekte-grid--2x2 a';

  // Mobile-/Touch-Erkennung
  const mm = window.matchMedia('(hover: none) and (pointer: coarse)');
  const looksLikeTouch = mm.matches || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  if (!looksLikeTouch) return;

  const tiles = Array.from(document.querySelectorAll(SELECTOR));
  if (!tiles.length) return;

  // Hilfsfunktion: prüfen, ob Mitte der Kachel in oberer Hälfte liegt
  function isInUpperHalf(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const visible = r.top < vh && r.bottom > 0; // Kachel sichtbar?
    if (!visible) return false;
    const elemMid = r.top + r.height / 2;
    return elemMid < vh / 2;
  }

  // IO zur Überwachung
  const io = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.toggle('inview', isInUpperHalf(entry.target));
          } else {
            entry.target.classList.remove('inview');
          }
        });
      }, { threshold: [0] })
    : null;

  if (io) tiles.forEach(el => io.observe(el));

  // Fallback + Live-Update bei Scroll/Resize
  function updateAll() {
    tiles.forEach(el => {
      el.classList.toggle('inview', isInUpperHalf(el));
    });
  }
  window.addEventListener('scroll', updateAll, { passive: true });
  window.addEventListener('resize', updateAll, { passive: true });
  window.addEventListener('orientationchange', updateAll);
  updateAll();
})();
