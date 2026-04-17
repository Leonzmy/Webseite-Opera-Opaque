/* ==============================
   Smart Galerie – 3 Spalten fix, Bild 5 über Spalte 2+3
   ============================== */

(function () {
  const GALERIE_HOEHE = 900; // px
  const GAP = 12; // px
  const SPALTEN = 3;
  const SPAN_INDEX = 2; // 0-basiert: Bild 5 = Index 4

  function layoutGalerie(links) {
    const galerie = document.querySelector('.projekt-galerie');
    if (!galerie || !links.length) return;

    const bilder = links.map(a => ({
      el: a,
      ratio: parseFloat(a.dataset.w) / parseFloat(a.dataset.h),
    }));

    const containerBreite = galerie.offsetWidth;
    const spaltenBreite = (containerBreite - GAP * (SPALTEN - 1)) / SPALTEN;

    // Grid aufbauen
    galerie.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${SPALTEN}, 1fr);
      gap: ${GAP}px;
      margin-top: 36px;
    `;

    bilder.forEach((b, i) => {
      const istSpan = (i === SPAN_INDEX);
      const breite = istSpan ? spaltenBreite * 2 + GAP : spaltenBreite;
      const hoehe = breite / b.ratio;

      b.el.style.cssText = `
        display: block;
        width: 100%;
        height: ${hoehe}px;
        overflow: hidden;
        border-radius: 8px;
        ${istSpan ? 'grid-column: span 2;' : ''}
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
