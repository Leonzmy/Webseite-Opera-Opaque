document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".frontpage .video-bg .video");
  if (!video) return;

  let videoFinished = false;

  // Wenn es spielt → sichtbar machen
  video.addEventListener("playing", () => {
    video.classList.add("playing");
  });

  const tryPlay = () => {
    if (videoFinished) return; // nach Ende nicht mehr starten
    video.muted = true;
    const p = video.play();
    if (p && p.catch) {
      p.catch(err => {
        console.log("Autoplay blockiert:", err);
      });
    }
  };

  // sofort versuchen
  tryPlay();

  // falls Tab zurückkehrt → nochmal probieren, solange Video nicht fertig
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.paused && !videoFinished) {
      tryPlay();
    }
  });

  // Wenn Video endet → auf letztem Frame stehen bleiben + Header dauerhaft
  video.addEventListener("ended", () => {
    video.pause();
    video.currentTime = video.duration;
    videoFinished = true;
    document.body.classList.add("scrolled");
  });

  // Scroll-Handling für Header (nur solange Video nicht fertig)
  window.addEventListener("scroll", () => {
    if (videoFinished) return;
    if (window.scrollY > 50) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  });
});
