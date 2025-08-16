// scroll_header.js
document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".frontpage .video-bg .video");
  if (!video) return;

  let videoFinished = false;
  let triedAuto = false;

  // --- HART sicherstellen: Inline + stumm + keine Controls ---
  video.muted = true;
  video.defaultMuted = true;         // iOS-Safari mag das
  video.setAttribute("muted", "");   // Attribut zusätzlich setzen
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.removeAttribute("controls");

  // Sichtbarkeit sofort heben, sobald es wirklich spielt
  const markPlaying = () => video.classList.add("playing");
  video.addEventListener("play", markPlaying);
  video.addEventListener("playing", markPlaying);

  // Wenn Video endet → letztes Frame + Header dauerhaft
  video.addEventListener("ended", () => {
    video.pause();
    video.currentTime = Math.max(0, video.duration || 0);
    videoFinished = true;
    document.body.classList.add("scrolled");
  });

  // Header-Scroll-Handling (nur solange Video nicht fertig)
  const onScroll = () => {
    if (videoFinished) return;
    if (window.scrollY > 50) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", onScroll);

  // --- Autoplay-Logik ---
  const tryPlay = async () => {
    if (videoFinished) return;
    try {
      // Manche Browser brauchen ein frisches load() vor play()
      if (video.readyState < 2) {
        // sorgt dafür, dass die Source sicher geladen ist
        video.load();
        // auf erstes abspielbares Frame warten (Timeout als Schutz)
        await Promise.race([
          new Promise(res => video.addEventListener("loadeddata", res, { once: true })),
          new Promise(res => video.addEventListener("canplay", res, { once: true })),
          new Promise(res => setTimeout(res, 500)) // notfalls kurz warten
        ]);
      }
      const p = video.play();
      if (p && typeof p.then === "function") await p;
      triedAuto = true;
    } catch (err) {
      // Autoplay blockiert → Fallback: beim ersten User-Event starten
      // (Nur EINMAL registrieren)
      if (!triedAuto) {
        ["touchstart", "pointerdown", "click", "keydown"].forEach(ev => {
          window.addEventListener(ev, () => {
            tryPlay(); // nochmal versuchen (nun ist Interaktion da)
          }, { once: true, passive: true });
        });
      }
    }
  };

  // Tab wird wieder sichtbar → ggf. erneut versuchen (solange nicht fertig)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.paused && !videoFinished) {
      tryPlay();
    }
  });

  // Manchmal feuert 'playing' nicht – sobald ein Frame da ist, sichtbar machen
  const onFirstFrame = () => {
    if (!video.classList.contains("playing")) {
      video.classList.add("playing");
    }
    video.removeEventListener("timeupdate", onFirstFrame);
  };
  video.addEventListener("timeupdate", onFirstFrame);

  // Sofort versuchen
  tryPlay();
});
