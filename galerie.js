/* ==============================
   Smart Galerie – CSS Grid, feste Höhe, Bild 5 über 2 Spalten
   ============================== */

(function () {
  const GALERIE_HOEHE = 900; // px
  const GAP = 12; // px
  const SPAN_INDEX = 4; // 0-basiert: Bild 5 = Index 4

  function layoutGalerie(links) {
    const galerie = document.querySelector('.projekt-galerie');
    if (!galerie || !links.length) return;

    const bilder = links.map(a => ({
      el: a,
      ratio: parseFloat(a.dataset.w) / parseFloat(a.dataset.h),
    }));

    const containerBreite = galerie.offsetWidth;

    // Optimale Spaltenanzahl (2–3) berechnen
    let besteSpalten = 2;
    let bestScore = Infinity;
    for (let s = 2; s <= 3; s++) {
      const sw = (containerBreite - GAP * (s - 1)) / s;
      const score = bewerteSpalten(bilder, s, sw, SPAN_INDEX);
      if (score < bestScore) {
        bestScore = score;
        besteSpalten = s;
      }
    }

    const spaltenBreite = (containerBreite - GAP * (besteSpalten - 1)) / besteSpalten;

    // Grid aufbauen
    galerie.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${besteSpalten}, 1fr);
      gap: ${GAP}px;
      margin-top: 36px;
    `;

    // Bildhöhen berechnen – Bild 5 ist doppelt so breit
    bilder.forEach((b, i) => {
      const istSpan = (i === SPAN_INDEX) && besteSpalten >= 2;
      const breite = istSpan ? spaltenBreite * 2 + GAP : spaltenBreite;
      const hoehe = breite / b.ratio;

      b.el.style.cssText = `
        display: block;
        width: 100%;
        height: ${hoehe}px;
        overflow: hidden;
        border-radius: 8px;
        ${istSpan ? `grid-column: span 2;` : ''}
      `;

      const img = b.el.querySelector('img');
      if (img) {
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        `;
      }
    });
  }

  function bewerteSpalten(bilder, anzahl, spaltenBreite, spanIdx) {
    // Simuliert Höhen mit Grid-Flow (keine echte Grid-Engine, Annäherung)
    const hoehen = new Array(anzahl).fill(0);
    bilder.forEach((b, i) => {
      if (i === spanIdx) {
        // Span-Bild: geht in die zwei kürzesten Spalten
        const sorted = [...hoehen].sort((a, b) => a - b);
        const refHoehe = sorted[0];
        const bildHoehe = (spaltenBreite * 2 + GAP) / b.ratio + GAP;
        // vereinfacht: beide Spalten auf gleiche Höhe
        const idxA = hoehen.indexOf(Math.min(...hoehen));
        hoehen[idxA] = refHoehe + bildHoehe;
        const idxB = hoehen.indexOf(Math.min(...hoehen));
        hoehen[idxB] = refHoehe + bildHoehe;
      } else {
        const minIdx = hoehen.indexOf(Math.min(...hoehen));
        hoehen[minIdx] += spaltenBreite / b.ratio + GAP;
      }
    });
    return Math.max(...hoehen) - Math.min(...hoehen);
  }

  function mobileLayout(links) {
    const galerie = document.querySelector('.projekt-galerie');
    if (!galerie) return;

    galerie.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${GAP}px;
      margin-top: 36px;
    `;

    links.forEach(a => {
      a.style.cssText = `
        display: block;
        width: 100%;
        height: auto;
        overflow: hidden;
        border-radius: 8px;
        grid-column: unset;
      `;
      const img = a.querySelector('img');
      if (img) {
        img.style.cssText = `width: 100%; height: auto; display: block;`;
      }
      galerie.appendChild(a);
    });
  }

  function ladeProportionen(links, callback) {
    let geladen = 0;
    if (!links.length) return;

    links.forEach(a => {
      const img = a.querySelector('img');
      if (!img) {
        a.dataset.w = 3; a.dataset.h = 2;
        geladen++;
        if (geladen === links.length) callback();
        return;
      }

      function onLoad() {
        a.dataset.w = img.naturalWidth || 3;
        a.dataset.h = img.naturalHeight || 2;
        geladen++;
        if (geladen === links.length) callback();
      }

      if (img.complete && img.naturalWidth > 0) {
        onLoad();
      } else {
        img.addEventListener('load', onLoad);
        img.addEventListener('error', () => {
          a.dataset.w = 3; a.dataset.h = 2;
          geladen++;
          if (geladen === links.length) callback();
        });
      }
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    const links = Array.from(document.querySelectorAll('.projekt-galerie a'));

    ladeProportionen(links, () => {
      function layout() {
        if (window.innerWidth < 600) {
          mobileLayout(links);
        } else {
          layoutGalerie(links);
        }
      }
      layout();
      window.addEventListener('resize', layout);
    });
  });

})();
