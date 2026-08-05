// projekte.js — Kacheln aktivieren sich einzeln, sobald sie beim Scrollen
// tatsächlich in den sichtbaren Bereich kommen (IntersectionObserver statt
// manueller Scroll-Prozent-Berechnung — robuster auf Mobilgeräten).
(function () {
  const SELECTOR = '.projekte-grid--2x2 a';

  // Nur Mobile/Touch (Desktop behält :hover)
  const mm = window.matchMedia('(hover: none) and (pointer: coarse)');
  const looksLikeTouch = mm.matches || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  if (!looksLikeTouch) return;

  const tiles = Array.from(document.querySelectorAll(SELECTOR));
  if (!tiles.length) return;

  if (!('IntersectionObserver' in window)) {
    // Sehr alter Browser ohne Unterstützung: einfach alle direkt anzeigen.
    tiles.forEach(el => el.classList.add('inview'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('inview', entry.isIntersecting);
    });
  }, {
    root: null,
    // Aktiviert eine Kachel, sobald sie die untere Bildschirmhälfte erreicht,
    // deaktiviert sie wieder, sobald sie weit genug aus dem Bild ist.
    rootMargin: '0px 0px -35% 0px',
    threshold: 0
  });

  tiles.forEach(el => observer.observe(el));
})();
