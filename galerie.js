/* ==============================
   Galerie: Masonry – unterer Rand gerade
   ============================== */

function balanceGalerie() {
  const galerie = document.querySelector('.projekt-galerie');
  if (!galerie) return;

  const links = Array.from(galerie.querySelectorAll('a'));
  if (!links.length) return;

  // Anzahl Spalten aus CSS auslesen
  const spalten = parseInt(getComputedStyle(galerie).columnCount);
  if (!spalten || spalten < 2) return;

  // margin-bottom vom letzten Bild zurücksetzen
  links.forEach(a => a.style.marginBottom = '');

  // Höhe jeder Spalte berechnen
  const gapStr = getComputedStyle(galerie).columnGap;
  const gap = parseFloat(gapStr) || 12;
  const containerWidth = galerie.offsetWidth;
  const spaltenBreite = (containerWidth - gap * (spalten - 1)) / spalten;

  // Bilder auf Spalten verteilen (greedy)
  const spaltenHoehen = new Array(spalten).fill(0);
  links.forEach(a => {
    const img = a.querySelector('img');
    if (!img) return;
    const ratio = img.naturalHeight / img.naturalWidth;
    const bildHoehe = spaltenBreite * ratio + 12; // 12 = margin-bottom
    // kürzeste Spalte finden
    const minIdx = spaltenHoehen.indexOf(Math.min(...spaltenHoehen));
    spaltenHoehen[minIdx] += bildHoehe;
  });

  // Differenz zur höchsten Spalte berechnen
  const maxHoehe = Math.max(...spaltenHoehen);

  // letztes Bild der kürzesten Spalten mit extra margin auffüllen
  // Einfachster Ansatz: letzte `spalten` Bilder prüfen
  const letzteLinks = links.slice(-spalten);
  const diff = maxHoehe - Math.min(...spaltenHoehen);

  if (diff > 0 && diff < 300) {
    letzteLinks.forEach(a => {
      a.style.marginBottom = (12 + diff / spalten) + 'px';
    });
  }
}

// Nach dem Laden der Bilder ausführen
window.addEventListener('load', balanceGalerie);
window.addEventListener('resize', balanceGalerie);
