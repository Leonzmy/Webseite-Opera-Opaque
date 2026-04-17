/* ==============================
   Smart Galerie – feste Höhe, automatische Spaltenaufteilung
   ============================== */

(function () {
  const GALERIE_HOEHE = 900; // px
  const GAP = 12; // px zwischen Bildern und Spalten

  function bewerteSpalten(bilder, anzahl, spaltenBreite) {
    const hoehen = new Array(anzahl).fill(0);
    bilder.forEach(b => {
      const minIdx = hoehen.indexOf(Math.min(...hoehen));
      hoehen[minIdx] += spaltenBreite / b.ratio + GAP;
    });
    return Math.max(...hoehen) - Math.min(...hoehen);
  }

  function layoutGalerie(links) {
    const galerie = document.querySelector('.projekt-galerie');
    if (!galerie || !links.length) return;

    const bilder = links.map(a => ({
      el: a,
      ratio: parseFloat(a.dataset.w) / parseFloat(a.dataset.h),
    }));

    const containerBreite = galerie.offsetWidth;

    // Optimale Spaltenanzahl (2–4) berechnen
    let besteSpalten = 2;
    let bestScore = Infinity;
    for (let s = 2; s <= 3; s++) {
      const sw = (containerBreite - GAP * (s - 1)) / s;
      const score = bewerteSpalten(bilder, s, sw);
      if (score < bestScore) {
        bestScore = score;
        besteSpalten = s;
      }
    }

    const spaltenBreite = (containerBreite - GAP * (besteSpalten - 1)) / besteSpalten;

    // Bilder greedy auf Spalten verteilen
    const spalten = Array.from({ length: besteSpalten }, () => []);
    const spaltenHoehen = new Array(besteSpalten).fill(0);

    bilder.forEach(b => {
      const minIdx = spaltenHoehen.indexOf(Math.min(...spaltenHoehen));
      spalten[minIdx].push(b);
      spaltenHoehen[minIdx] += spaltenBreite / b.ratio + GAP;
    });

    // Skalierung: längste Spalte auf GALERIE_HOEHE bringen
    const maxHoehe = Math.max(...spaltenHoehen) - GAP;
    const scale = GALERIE_HOEHE / maxHoehe;

    // DOM aufbauen
    galerie.innerHTML = '';
    galerie.style.cssText = `
      display: flex;
      gap: ${GAP}px;
      height: ${GALERIE_HOEHE}px;
      align-items: flex-start;
    `;

    spalten.forEach(spalte => {
      const div = document.createElement('div');
      div.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: ${GAP}px;
        flex: 1;
      `;

      spalte.forEach(b => {
        const bildHoehe = (spaltenBreite / b.ratio) * scale;
        b.el.style.cssText = `
          display: block;
          width: 100%;
          height: ${bildHoehe}px;
          overflow: hidden;
          border-radius: 8px;
          flex-shrink: 0;
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

        div.appendChild(b.el);
      });

      galerie.appendChild(div);
    });
  }

  function mobileLayout(links) {
    const galerie = document.querySelector('.projekt-galerie');
    if (!galerie) return;

    galerie.innerHTML = '';
    galerie.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${GAP}px;
      height: auto;
    `;

    links.forEach(a => {
      a.style.cssText = `
        display: block;
        width: 100%;
        height: auto;
        overflow: hidden;
        border-radius: 8px;
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
    // Links VOR DOM-Manipulation speichern
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
