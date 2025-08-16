// projekte.js (robust v2)
(function () {
  // OPTIONAL: Nur auf Projekte-Seite laufen lassen (auskommentieren, wenn unsicher)
//  if (!document.body.classList.contains('projekte')) return;

  // Mobile-/Touch-Heuristik (breiter gefasst: MatchMedia ODER maxTouchPoints)
  const mm = window.matchMedia('(hover: none) and (pointer: coarse)');
  const looksLikeTouch = mm.matches || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  if (!looksLikeTouch) {
    console.debug('[projekte.js] skip: kein Touch/Mobile erkannt');
    return;
  }

  const tiles = document.querySelectorAll('.projekte-grid--2x2 a');
  if (!tiles.length) {
    console.warn('[projekte.js] keine Kacheln gefunden: .projekte-grid--2x2 a');
    return;
  }

  // Fallback ohne IO → alles sichtbar
  if (!('IntersectionObserver' in window)) {
    tiles.forEach(el => el.classList.add('inview'));
    console.debug('[projekte.js] IO fehlt → alle Kacheln inview');
    return;
  }

 const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const rect = entry.target.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // Mitte des Elements
      const elemMid = rect.top + rect.height / 2;

      // Bedingung: Mitte liegt in oberer Bildschirmhälfte
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
  threshold: [0] // nur grobe Sichtbarkeitsprüfung, Details machen wir selbst
});

  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: [0, 0.35, 0.6]
  });

  tiles.forEach(el => io.observe(el));

  // Initialprüfung: Elemente, die beim Laden schon sichtbar sind, sofort markieren
  const initialCheck = () => {
    tiles.forEach(el => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = r.top < vh * 0.65 && r.bottom > vh * 0.15;
      if (visible) el.classList.add('inview');
    });
  };
  initialCheck();
  window.addEventListener('resize', initialCheck, { passive: true });

  console.debug('[projekte.js] aktiv: Mobile-Inview-Swap läuft für', tiles.length, 'Kacheln');
})();

