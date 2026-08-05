// about.js — Team-Kacheln aktivieren sich einzeln, sobald sie beim Scrollen
// tatsächlich in den sichtbaren Bereich kommen (IntersectionObserver statt
// manueller Scroll-Prozent-Berechnung — robuster auf Mobilgeräten).
(function () {
  const SELECTOR = '.fullwidth-gallery .person';

  // Touch-Erkennung + Body-Flag setzen
  const isTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
                  window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) return;
  document.body.classList.add('touch');

  const tiles = Array.from(document.querySelectorAll(SELECTOR));
  if (!tiles.length) return;

  if (!('IntersectionObserver' in window)) {
    tiles.forEach(el => el.classList.add('inview'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('inview', entry.isIntersecting);
    });
  }, {
    root: null,
    rootMargin: '0px 0px -35% 0px',
    threshold: 0
  });

  tiles.forEach(el => observer.observe(el));
})();
