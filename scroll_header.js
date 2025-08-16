// scroll_header.js
document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".frontpage .video-bg .video");
  if (!video) return;

  let videoFinished = false;
  let triedAuto = false;
  let retriesLeft = 4;
  const RETRY_DELAY = 300; // ms

  // --- 1) Attribute/Properties VOR dem Laden hart setzen ---
  const hardenAttrs = () => {
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("autoplay", ""); // hilft manchen Engines
    video.removeAttribute("controls");
    video.volume = 0;
  };
  hardenAttrs();

  // Falls im HTML <source> steckt, Source in src übernehmen,
  // damit wir die Lade-Reihenfolge kontrollieren.
  const sourceEl = video.querySelector("source");
  if (sourceEl && !video.src) {
    video.src = sourceEl.src; // resolved URL
    // optional: Source-Element entfernen, damit nur noch src zählt
    // sourceEl.parentNode.removeChild(sourceEl);
  }

  // --- Sichtbarkeit: sobald irgendein Frame/Play da ist ---
  const markVisible = () => video.classList.add("playing");
  video.addEventListener("play", markVisible);
  video.addEventListener("playing", markVisible);
  video.addEventListener("loadeddata", markVisible);
  video.addEventListener("timeupdate", function onFirstTU() {
    markVisible();
    video.removeEventListener("timeupdate", onFirstTU);
  });

  // --- KEIN LOOP: am Ende auf letztem Frame stehen bleiben ---
  video.addEventListener("ended", () => {
    video.pause();
    // auf letztem Frame einfrieren
    try { video.currentTime = Math.max(0, video.duration || 0); } catch {}
    videoFinished = true;
    document.body.classList.add("scrolled");
  });

  // --- Header-Scroll, solange Video nicht fertig ---
  window.addEventListener("scroll", () => {
    if (videoFinished) return;
    if (window.scrollY > 50) document.body.classList.add("scrolled");
    else document.body.classList.remove("scrolled");
  });

  // --- 2) Autoplay-Start + kurze Retries ---
  const tryPlay = async () => {
    if (videoFinished) return;
    hardenAttrs();

    try {
      // frisch laden, dann auf abspielbares Frame warten
      if (video.readyState < 2) {
        video.load();
        await Promise.race([
          new Promise(res => video.addEventListener("loadeddata", res, { once: true })),
          new Promise(res => video.addEventListener("canplay", res, { once: true })),
          new Promise(res => setTimeout(res, 500))
        ]);
      }
      const p = video.play();
      if (p && typeof p.then === "function") await p;
      triedAuto = true;
      markVisible();
    } catch (err) {
      if (retriesLeft-- > 0) {
        setTimeout(tryPlay, RETRY_DELAY);
      } else {
        // Fallback: erster Touch/Klick IRGENDWO startet das Video
        const onceOpts = { once: true, passive: true, capture: true };
        const trigger = () => tryPlay();
        ["touchstart", "pointerdown", "mousedown", "keydown", "click"].forEach(ev => {
          document.documentElement.addEventListener(ev, trigger, onceOpts);
        });
        // zusätzlich direkt auf dem Video für den Fall, dass Events „geschluckt“ werden
        ["touchstart", "pointerdown", "click"].forEach(ev => {
          video.addEventListener(ev, trigger, onceOpts);
        });
      }
    }
  };

  // Wenn Tab wieder aktiv wird → nochmals probieren
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.paused && !videoFinished) {
      retriesLeft = Math.max(retriesLeft, 2);
      tryPlay();
    }
  });

  // iOS-Safari Spezial: onload nochmal schubsen
  window.addEventListener("load", () => {
    if (!triedAuto && !videoFinished) tryPlay();
  }, { once: true });

  // Sofort starten
  tryPlay();
});
