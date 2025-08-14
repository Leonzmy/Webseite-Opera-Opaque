// tiles_slideshow.js – automatische Diashow für Kacheln
(function () {
  const TICK_MS = 4000;
  const tiles = Array.from(document.querySelectorAll('.tile.slideshow'));
  tiles.forEach((tile, index) => {
    const list = (tile.getAttribute('data-images') || '').split(',').map(s => s.trim()).filter(Boolean);
    const layers = tile.querySelectorAll('img.layer');
    if (!list.length || layers.length < 2) return;

    list.forEach(src => { const i = new Image(); i.src = src; });

    let idx = 0;
    let a = layers[0]; let b = layers[1];
    function next() {
      idx = (idx + 1) % list.length;
      b.src = list[idx];
      if (b.complete) {
        requestAnimationFrame(()=>{
          b.classList.add('show');
          a.classList.remove('show');
          [a, b] = [b, a];
        });
      } else {
        b.onload = () => {
          b.classList.add('show');
          a.classList.remove('show');
          [a, b] = [b, a];
        };
      }
    }
    // versetzter Start pro Kachel
    setTimeout(() => {
      setInterval(next, TICK_MS);
    }, index * (TICK_MS / tiles.length));
  });
})();
