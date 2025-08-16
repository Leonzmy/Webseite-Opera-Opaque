// scroll_header.js
document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".frontpage .video-bg .video");
  if (!video) return;

  let videoFinished = false;
  let triedAuto = false;
  let retriesLeft = 5;          // kurze Retry-Phase
  const RETRY_DELAY = 350;      // ms

  // --- Attribute & Properties doppelt absichern ---
  const hardenAttrs = () => {
    video.muted = true;
    video.defaultMuted = true;
    if (!video.hasAttribute("muted")) video.setAttribute("muted", "");

    video.playsInline = true;
    if (!video.hasAttribute("playsinline")) video.setAttribute("playsinline", "");
    if (!video.hasAttribute("webkit-playsinline")) video.setAttribute("webkit-playsinline", "");

    // auch Autoplay als Attribut setzen (hilft bei manchen Engines)
    if (!video.hasAttribute("autoplay")) video.setAttribute("autoplay", "");

    video.removeAttribute("controls");
    // keine Lautstärke – beruhigt manche Browser
    video.volume = 0;
  };
  hardenAttrs();

  // Sichtbarkeit: sobald irgendein Frame/Play ankommt
  const markVisible = () => video.classList.add("playing");
  video.addEventListener("play", markVisible);
  video.addEventListener("playing", markVisible);
  video.addEventListener("loadeddata", markVisible);
  video.addEventListener("timeupdate", function onFirstTU() {
    markVisible();
    video.removeEventListener("timeupdate", onFirstTU);
  });

  // Ende: nur relevant, wenn du NICHT loopst. Mit loop wird dieses Event selten erreicht.
  video.addEventListener("ended", () => {
    // Wenn du loop im <video> hast, kannst du diesen Block löschen.
    video.pause();
    video.currentTime = Math.max(0, video.duration || 0);
    videoFinished = true;
    document.body.classList.add("scrolled");
  });

  // Header-Scroll-Handling
  window.addEventListener("scroll", () => {
    if (videoFinished) return;
    if (window.scrollY > 50) document.body.classList.add("scrolled");
    else document.body.classList.remove("scrolled");
  });

  // --- Autoplay versuchen (mit kurzen Retries) ---
  const tryPlay = async () => {
    if (videoFinished) return;
    hardenAttrs(); // falls Browser Attribute „verliert“

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
      // kurzer Retry-Zyklus (Browser braucht oft 1–2 Versuche)
      if (retriesLeft-- > 0) {
        setTimeout(tryPlay, RETRY_DELAY);
      } else {
        // finaler Fallback: beim ersten User-Event starten
        ["touchstart", "pointerdown", "click", "keydown"].forEach(ev => {
          window.addEventListener(ev, () => {
            tryPlay();
          }, { once: true, passive: true });
        });
      }
    }
  };

  // Wenn Tab wieder aktiv wird → nochmal probieren
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.paused && !videoFinished) {
      retriesLeft = Math.max(retriesLeft, 2); // kleine Retry-Reserve
      tryPlay();
    }
  });

  // direkt loslegen
  tryPlay();
});
