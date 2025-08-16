// scroll_header.js (clean version)

document.addEventListener("DOMContentLoaded", function () {
  const video = document.querySelector(".frontpage .video-bg .video");
  const header = document.querySelector("header");
  let videoFinished = false;

  if (video) {
    // Try autoplay immediately
    const tryPlay = () => {
      video.muted = true;
      const p = video.play();
      if (p && p.catch) {
        p.catch(err => console.log("Autoplay blockiert:", err));
      }
    };
    tryPlay();

    // Retry autoplay on first user interaction (for mobile browsers)
    ["touchstart","pointerdown","click","scroll"].forEach(ev => {
      window.addEventListener(ev, tryPlay, { once: true, passive: true });
    });

    // When video ends, freeze on last frame and show header permanently
    video.addEventListener("ended", function () {
      video.pause();
      video.currentTime = video.duration;
      document.body.classList.add("scrolled");
      videoFinished = true;
    });
  }

  // Scroll handling for header visibility
  window.addEventListener("scroll", function () {
    if (videoFinished) return;
    if (window.scrollY > 50) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  });
});
