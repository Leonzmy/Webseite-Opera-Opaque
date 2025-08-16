document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".frontpage .video-bg .video");
  if (!video) return;

  // Sobald es wirklich läuft → sichtbar machen
  video.addEventListener("playing", () => {
    video.classList.add("playing");
  });

  // iOS-Hack: auch wenn "autoplay" gesetzt ist, zusätzlich manuell triggern
  const tryPlay = () => {
    video.muted = true; // Autoplay-Requirement
    const p = video.play();
    if (p && p.catch) {
      p.catch(() => {
        // Fehler ignorieren (z. B. Autoplay-Block)
      });
    }
  };

  // sofort versuchen
  tryPlay();

  // beim ersten User-Event nochmal versuchen
  ["touchstart", "pointerdown", "click", "scroll"].forEach(ev => {
    window.addEventListener(ev, tryPlay, { once: true, passive: true });
  });

  // falls Tab im iOS Safari pausiert → beim Sichtbarwerden neu starten
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.paused) tryPlay();
  });
});
