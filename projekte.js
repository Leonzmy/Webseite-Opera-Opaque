// projekte.js
(function () {
  // Falls du die Body-Klasse sicher hast, kannst du das einkommentieren:
  // if (!document.body.classList.contains('projekte')) return;

  // Mobile-/Touch-Erkennung
  const mm = window.matchMedia('(hover: none) and (pointer: coarse)');
  const looksLikeTouch = mm.matches || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  if (!looksLikeTouch) {
    console.debug('[projekte.js] nicht auf Mobile → Script beendet');
    return;
  }

  const tiles = document.querySelectorAll('.projekte-grid--2x2 a');
  if (!tiles.length) {
    console.warn('[projekte.js] keine Projekt-Kacheln gefunden');
    return;
  }

  // Fallback: ohne IO alles sofort sichtbar
  if (!('IntersectionObserver' in window)) {
    tiles.forEach(el => el.classList.add('inview'));
    console.debug('[projekte.js] IntersectionObserver fehlt → alle Kacheln inview');
    return;
  }

  // Neuer IO: prüft, ob Kachel-Mitte in oberer Hälfte liegt
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const rect = entry.target.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const elemMid = rect.top + rect.height / 2;

        if (elemMid < vh / 2) {
          entry.target.classList.add('inview');
        } else {
          entry.target.classList.remove('inview');
        }
      } else {
        entry.target.classList.remove('inview');
      }
    });
  }, {
    threshold: [0] // nur grob prüfen, Rest machen wir mit getBoundingClientRect
  });

  tiles.forEach(el => io.observe(el));

  console.debug('[projekte.js] aktiv für', tiles.length, 'Kacheln');
})();
