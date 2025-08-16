// Status merken, ob das Video fertig abgespielt ist
let videoFinished = false;

// Scroll-Logik für Header
document.addEventListener("scroll", function () {
  if (videoFinished) return; // Nichts ändern, wenn Video fertig
  const triggerHeight = window.innerHeight * 0.1; 
  if (window.scrollY > triggerHeight) {
    document.body.classList.add("scrolled");
  } else {
    document.body.classList.remove("scrolled");
  }
});

// Wenn Video endet, Header dauerhaft anzeigen – robust (auch mobil/loop)
document.addEventListener("DOMContentLoaded", function () {
  const video = document.querySelector(".frontpage .video-bg .video");
  if (!video) return;

  const showHeader = () => {
    document.body.classList.add("scrolled");
    videoFinished = true; // Ab jetzt Scroll-Entfernung deaktivieren
    cleanup();
  };

  const onEnded = () => showHeader();

  // Falls 'ended' wegen 'loop' nie feuert oder iOS zickt:
  // 1) Track "nahe am Ende"
  // 2) Erkenne Loop (Sprung von ~Ende zurück an den Anfang) => showHeader()
  let sawNearEnd = false;
  const onTimeupdate = () => {
    if (videoFinished) return;
    const d = video.duration;
    if (!isFinite(d) || d <= 0) return;
    const progress = video.currentTime / d;

    if (progress >= 0.985) {
      sawNearEnd = true;
    }
    // Loop erkannt: nach "nahe Ende" springt currentTime wieder nahe 0
    if (sawNearEnd && video.currentTime < 0.2) {
      showHeader();
    }
  };

 
// Wenn Video endet, Header dauerhaft anzeigen
document.addEventListener("DOMContentLoaded", function () {
  const video = document.querySelector(".frontpage .video-bg .video");
  if (video) {
    video.addEventListener("ended", function () {
      document.body.classList.add("scrolled");
      videoFinished = true; // Ab jetzt Scroll-Entfernung deaktivieren
    });
  }
});

