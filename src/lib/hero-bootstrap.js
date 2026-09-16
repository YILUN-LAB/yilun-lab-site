// Inline in the homepage head: choose the poster before the body can paint.
// Keep this a self-contained classic script; module scripts run too late.
(() => {
  const root = document.documentElement;
  if (root.dataset.heroVideo) return;
  const assets = JSON.parse(document.currentScript.dataset.heroAssets);
  const videos = assets.map((asset) => asset.original);
  let queue = [];
  let last = null;
  try {
    const stored = JSON.parse(localStorage.getItem("yilun-hero-queue") ?? "[]");
    queue = Array.isArray(stored) ? stored : [];
    last = localStorage.getItem("yilun-hero-last");
  } catch {
    // Unavailable or corrupted storage must not prevent the first frame.
  }
  queue = queue.filter((video) => videos.includes(video));
  if (queue.length === 0) {
    queue = [...videos];
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    if (last && queue[0] === last && queue.length > 1) {
      [queue[0], queue[1]] = [queue[1], queue[0]];
    }
  }
  const chosen = queue.shift();
  const asset = assets.find((asset) => asset.original === chosen);
  root.style.setProperty("--hero-poster", `url("${asset.poster}")`);
  root.dataset.heroVideo = chosen;
  const preload = document.createElement("link");
  preload.rel = "preload";
  preload.as = "image";
  preload.href = asset.poster;
  preload.fetchPriority = "high";
  document.head.appendChild(preload);
  try {
    localStorage.setItem("yilun-hero-queue", JSON.stringify(queue));
    localStorage.setItem("yilun-hero-last", chosen);
  } catch {
    // The document selection is already fixed even without rotation memory.
  }
})();
