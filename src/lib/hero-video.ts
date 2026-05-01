const VIDEOS = [
  "/assets/videos/hero-1.mp4",
  "/assets/videos/hero-2.mp4",
  "/assets/videos/hero-3.mp4",
  "/assets/videos/hero-4.mp4",
];

const QUEUE_KEY = "yilun-hero-queue";
const LAST_KEY = "yilun-hero-last";

export function pickHeroVideo(): string {
  let queue: string[] = [];
  let last: string | null = null;

  try {
    queue = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
    last = localStorage.getItem(LAST_KEY);
  } catch {
    /* corrupted storage — fall through to a fresh shuffle */
  }

  queue = queue.filter((v) => VIDEOS.includes(v));

  if (queue.length === 0) {
    queue = shuffle([...VIDEOS]);
    if (last && queue[0] === last && queue.length > 1) {
      [queue[0], queue[1]] = [queue[1], queue[0]];
    }
  }

  const chosen = queue.shift()!;

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    localStorage.setItem(LAST_KEY, chosen);
  } catch {
    /* storage unavailable — non-fatal, just lose rotation memory */
  }

  return chosen;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
