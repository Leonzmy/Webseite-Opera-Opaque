// projekte.js
(function () {
  // Nur auf der Projekte-Seite laufen
  if (!document.body.classList.contains('projekte')) return;

  // Nur Mobile: Hover gibt's nicht, Eingabe ist "coarse" (Finger)
  const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (!isMobile) return;

  const tiles = document.querySelectorAll('.projekte-grid--2x2 a');

  // Fallback: wenn kein IntersectionObserver verfügbar -> alle sichtbar
  if (!('IntersectionObserver' in window)) {
    tiles.forEach(el => el.classList.add('inview'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
        entry.target.classList.add('inview');
      } else {
        entry.target.classList.remove('inview');
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: [0, 0.35, 0.6]
  });

  tiles.forEach(el => io.observe(el));
})();
