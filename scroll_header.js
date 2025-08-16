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

  // --- Header-
