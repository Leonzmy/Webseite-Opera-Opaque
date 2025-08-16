document.addEventListener("scroll", function() {
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
