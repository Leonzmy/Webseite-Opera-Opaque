// scroll_header.js
// Läuft ausschließlich auf der Startseite (body.frontpage / .frontpage .video-bg .video).
// Auf allen anderen Seiten passiert nichts (keine Fehler, kein Effekt).
document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".frontpage .video-bg .video");
  if (!video) return; // nicht die Startseite -> hier abbrechen

  const content = document.querySelector(".frontpage-content");

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
    try { video.currentTime = Math.max(0, video.duration || 0); } catch {}
    videoFinished = true;
    document.body.classList.add("scrolled");
    if (content) content.classList.remove("hidden");
  });

  // Fallback: falls das Video gar nicht lädt, Inhalt trotzdem zeigen.
  video.addEventListener("error", () => {
    if (content) content.classList.remove("hidden");
  });

  // --- Header einblenden: sobald sich die Maus bewegt ODER gescrollt wird ---
  // (einmalig, bleibt danach sichtbar — kein Wieder-Ausblenden)
  function revealHeader() {
    document.body.classList.add("scrolled");
  }
  window.addEventListener("mousemove", revealHeader, { once: true, passive: true });
  window.addEventListener("scroll", revealHeader, { once: true, passive: true });
  window.addEventListener("touchstart", revealHeader, { once: true, passive: true });

  // --- 2) Autoplay-Start + kurze Retries ---
  const tryPlay = async () => {
    if (videoFinished) return;
    hardenAttrs();

    try {
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
        const onceOpts = { once: true, passive: true, capture: true };
        const trigger = () => tryPlay();
        ["touchstart", "pointerdown", "mousedown", "keydown", "click"].forEach(ev => {
          document.documentElement.addEventListener(ev, trigger, onceOpts);
        });
        ["touchstart", "pointerdown", "click"].forEach(ev => {
          video.addEventListener(ev, trigger, onceOpts);
        });
      }
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.paused && !videoFinished) {
      retriesLeft = Math.max(retriesLeft, 2);
      tryPlay();
    }
  });

  window.addEventListener("load", () => {
    if (!triedAuto && !videoFinished) tryPlay();
  }, { once: true });

  tryPlay();
});
