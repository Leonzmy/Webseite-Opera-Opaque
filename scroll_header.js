
// scroll_header.js — stable header + mobile autoplay helper

let videoFinished = false;

function updateHeaderVisibility() {
  if (videoFinished) {
    document.body.classList.add("scrolled");
    return;
  }
  const isMobile = window.innerWidth <= 900;
  const y = window.scrollY || window.pageYOffset || 0;

  if (isMobile) {
    // Mobile: Header sichtbar, wenn man unterhalb des Hero-Covers ist
    const hero = document.querySelector(".hero-cover");
    if (hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      if (y >= heroBottom - 1) {
        document.body.classList.add("scrolled");
      } else {
        document.body.classList.remove("scrolled");
      }
    }
  } else {
    // Desktop: wie zuvor – nach 10% Scrollweg
    const trigger = window.innerHeight * 0.1;
    if (y > trigger) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  }
}

document.addEventListener("scroll", updateHeaderVisibility, { passive: true });
window.addEventListener("resize", updateHeaderVisibility);

// Video handling
document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".frontpage .video-bg .video");
  if (!video) {
    updateHeaderVisibility();
    return;
  }

  const showHeader = () => {
    document.body.classList.add("scrolled");
    videoFinished = true;
    cleanup();
  };

  // Video sichtbar machen, sobald es wirklich spielt (CSS blendet ein)
  video.addEventListener("playing", () => {
    video.classList.add("playing");
  }, { passive: true });

  // Robust: Ende / Loop-Erkennung
  let sawNearEnd = false;
  const onTimeupdate = () => {
    if (videoFinished) return;
    const d = video.duration;
    if (!isFinite(d) || d <= 0) return;
    const progress = video.currentTime / d;
    if (progress >= 0.985) sawNearEnd = true;
    if (sawNearEnd && video.currentTime < 0.2) showHeader();
  };

  const onEnded = () => showHeader();

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

  // Autoplay-Kick (für iOS/Android). Spielt keine Rolle auf Desktop.
  const tryPlay = () => {
    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };
  tryPlay();
  ["touchstart","pointerdown","click","scroll"].forEach(ev => {
    window.addEventListener(ev, tryPlay, { once: true, passive: true });
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.paused) tryPlay();
  });

  // Initialer Zustand des Headers setzen
  updateHeaderVisibility();
});
