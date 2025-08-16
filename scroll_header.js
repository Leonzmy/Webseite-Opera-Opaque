// scroll_header.js

// 1) Desktop-Logik: Header nach 10% Scrollen zeigen
let videoFinished = false;

function updateOnScroll() {
  if (videoFinished) return; // nichts tun, wenn Video fertig
  const triggerHeight = window.innerHeight * 0.1;
  if (window.scrollY > triggerHeight) {
    document.body.classList.add("scrolled");
  } else {
    document.body.classList.remove("scrolled");
  }
}

document.addEventListener("scroll", updateOnScroll, { passive: true });

// 2) Video-Ende robust erkennen (auch mobil & bei loop)
document.addEventListener("DOMContentLoaded", function () {
  const video = document.querySelector(".frontpage .video-bg .video");
  if (!video) return;

  const showHeader = () => {
    document.body.classList.add("scrolled");
    videoFinished = true; // ab jetzt Scroll-Entfernung deaktivieren
    cleanup();
  };

  const onEnded = () => showHeader();

  // Loop-/iOS-Fall: "nahe Ende" + Sprung auf Anfang erkennen
  let sawNearEnd = false;
  const onTimeupdate = () => {
    if (videoFinished) return;
    const d = video.duration;
    if (!isFinite(d) || d <= 0) return;
    const progress = video.currentTime / d;
    if (progress >= 0.985) sawNearEnd = true;
    if (sawNearEnd && video.currentTime < 0.2) showHeader();
  };

  // Fallback: spätestens nach Videolänge (oder 8s) Header zeigen
  const fallbackMs =
    isFinite(video.duration) && video.duration > 0
      ? video.duration * 1000
      : 8000;
  const fallbackTimer = setTimeout(() => {
    if (!videoFinished) showHeader();
  }, fallbackMs);

  const cleanup = () => {
    video.removeEventListener("ended", onEnded);
    video.removeEventListener("timeupdate", onTimeupdate);
    video.removeEventListener("error", showHeader);
    clearTimeout(fallbackTimer);
  };

  video.addEventListener("ended", onEnded, { passive: true });
  video.addEventListener("timeupdate", onTimeupdate, { passive: true });
  video.addEventListener("error", showHeader, { passive: true });

  // 3) Autoplay-Kick für Mobile (falls blockiert)
  const tryPlay = () => {
    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };
  tryPlay(); // sofort versuchen
  ["touchstart","pointerdown","click","scroll"].forEach(ev => {
    window.addEventListener(ev, tryPlay, { once: true, passive: true });
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.paused) tryPlay();
  });
});
