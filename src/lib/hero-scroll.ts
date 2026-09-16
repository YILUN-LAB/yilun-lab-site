import { animate, type MotionValue } from "motion/react";

const NAVIGATE_EVENT = "yilun:home-navigation";
const EPSILON = 2;

export function navigateHomeSection(target: string) {
  const event = new CustomEvent(NAVIGATE_EVENT, { cancelable: true, detail: target });
  if (!window.dispatchEvent(event)) return;
  const element = document.getElementById(target);
  if (element)
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY,
      behavior: "smooth",
    });
}

export function heroExposure(position: number, start: number, end: number) {
  return Math.max(0, Math.min(1, 1 - (position - start) / Math.max(1, end - start)));
}

// Let overflowing Hero content, forms, menus and nested scrollers consume their
// own gestures before asking the page to move to another scene.
function canScrollWithin(target: EventTarget | null, delta: number) {
  let element = target instanceof Element ? target : null;
  while (element && element !== document.body && element !== document.documentElement) {
    if (/auto|scroll/.test(getComputedStyle(element).overflowY)) {
      const remaining = element.scrollHeight - element.clientHeight - element.scrollTop;
      if (delta > 0 ? remaining > EPSILON : element.scrollTop > EPSILON) return true;
    }
    element = element.parentElement;
  }
  return false;
}
function isEditing(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !!target.closest("input, textarea, select, [contenteditable=true], [data-hero-debug]")
  );
}

/** Only the Hero / Lab boundary snaps. Everything below Lab scrolls normally. */
export function createHeroScrollController({
  hero,
  content,
  exposure,
  playbackReady,
  onReveal,
}: {
  hero: HTMLElement;
  content: HTMLElement;
  exposure: MotionValue<number>;
  playbackReady?: MotionValue<boolean>;
  onReveal: (visible: boolean) => void;
}) {
  const lab = document.getElementById("lab");
  if (!lab) return () => {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let start = 0;
  let end = 1;
  let previousY = window.scrollY;
  let direction = 1;
  let revealed = true;
  let returning = false;
  let animation: { stop: () => void } | undefined;
  let destination: number | undefined;
  let destinationId: string | undefined;
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;
  let quietUntil = 0;
  let finishedAt = 0;
  let lastWheelAt = 0;
  let wheelSum = 0;
  let touchX = 0;
  let touchY = 0;
  let touchClaimed = false;
  let singleTouch = false;
  let disposed = false;

  const reveal = (visible: boolean) => {
    if (!visible) returning = true;
    content.inert = !visible;
    if (revealed === visible) return;
    revealed = visible;
    onReveal(visible);
  };
  const phase = (value: string) => {
    if (hero.dataset.heroState !== value) hero.dataset.heroState = value;
  };
  const sync = (position = window.scrollY) => {
    const amount = heroExposure(position, start, end);
    exposure.set(amount);
    if (amount <= 0) {
      reveal(false);
      if (!animation) phase("outside");
    } else if (amount >= 1 && !animation) {
      // On return, finish accelerating and presenting video before starting UI.
      // Initial page content and static/error fallbacks remain accessible.
      if (!returning || reduced.matches || playbackReady?.get() !== false) {
        returning = false;
        reveal(true);
      }
      phase("inside");
    }
    previousY = position;
  };
  const measure = () => {
    start = hero.getBoundingClientRect().top + window.scrollY;
    end = lab.getBoundingClientRect().top + window.scrollY;
  };
  const go = (target: number, id?: string) => {
    if (disposed || (animation && destination === target)) return;
    animation?.stop();
    clearTimeout(scrollTimer);
    const from = window.scrollY;
    direction = target < from ? -1 : 1;
    destination = target;
    destinationId = id;
    if (direction > 0) reveal(false);
    phase(direction < 0 ? "entering" : "exiting");
    if (target === start) content.scrollTop = 0;
    const complete = () => {
      animation = undefined;
      destination = undefined;
      destinationId = undefined;
      finishedAt = performance.now();
      quietUntil = lastWheelAt + 160;
      window.scrollTo({ top: target, behavior: "instant" });
      sync(target);
    };
    if (reduced.matches || Math.abs(target - from) < EPSILON) {
      complete();
      return;
    }
    animation = animate(from, target, {
      duration: 1.25,
      ease: [0.22, 0.61, 0.36, 1],
      onUpdate: (value) => {
        window.scrollTo({ top: value, behavior: "instant" });
        sync(value);
      },
      onComplete: complete,
    });
  };
  const settle = () => {
    if (animation || disposed) return;
    const y = window.scrollY;
    if (y > start + EPSILON && y < end - EPSILON) go(direction < 0 ? start : end);
  };
  const onScroll = () => {
    if (!animation) {
      const delta = window.scrollY - previousY;
      if (Math.abs(delta) > 0.5) direction = Math.sign(delta);
      if (window.scrollY > start + EPSILON && window.scrollY < end - EPSILON) {
        phase(direction < 0 ? "entering" : "exiting");
        if (direction > 0) reveal(false);
      }
    }
    sync();
    clearTimeout(scrollTimer);
    if (!animation) scrollTimer = setTimeout(settle, 160);
  };
  const targetFor = (delta: number) => {
    const y = window.scrollY;
    if (delta > 0 && y < end - EPSILON) return end;
    if (delta < 0 && y > start + EPSILON && y <= end + Math.min(Math.abs(delta), 100) + EPSILON)
      return start;
    return undefined;
  };
  const onWheel = (event: WheelEvent) => {
    if (
      !event.cancelable ||
      event.ctrlKey ||
      event.metaKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
      isEditing(event.target)
    )
      return;
    const delta =
      event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    if (!delta) return;
    const now = performance.now();
    const continuous = now - lastWheelAt < 160;
    lastWheelAt = now;
    // Consume the remainder of the gesture that initiated a scene transition,
    // with a bounded tail, so trackpad momentum cannot immediately skip Lab.
    if (
      animation ||
      (now < quietUntil && now - finishedAt < 700 && Math.sign(delta) === direction)
    ) {
      event.preventDefault();
      quietUntil = now + 160;
      return;
    }
    if (canScrollWithin(event.target, delta)) return;
    const target = targetFor(delta);
    if (target === undefined) return;
    event.preventDefault();
    wheelSum = continuous && Math.sign(wheelSum) === Math.sign(delta) ? wheelSum + delta : delta;
    if (Math.abs(wheelSum) >= 18) {
      wheelSum = 0;
      go(target);
    }
  };
  const onKey = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      isEditing(event.target)
    )
      return;
    if (event.key === " " && event.target instanceof Element && event.target.closest("button, a"))
      return;
    if (event.key === "Home") {
      event.preventDefault();
      go(start);
      return;
    }
    const delta =
      ["ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey)
        ? 1
        : ["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey)
          ? -1
          : 0;
    if (!delta) return;
    if (animation) {
      event.preventDefault();
      return;
    }
    if (canScrollWithin(event.target, delta)) return;
    const target = targetFor(delta);
    if (target !== undefined) {
      event.preventDefault();
      go(target);
    }
  };
  const onTouchStart = (event: TouchEvent) => {
    singleTouch = event.touches.length === 1;
    touchClaimed = false;
    if (singleTouch) {
      touchX = event.touches[0].clientX;
      touchY = event.touches[0].clientY;
    }
  };
  const onTouchMove = (event: TouchEvent) => {
    if (!singleTouch || event.touches.length !== 1 || !event.cancelable || isEditing(event.target))
      return;
    if (touchClaimed || animation) {
      event.preventDefault();
      return;
    }
    const delta = touchY - event.touches[0].clientY;
    const horizontal = Math.abs(touchX - event.touches[0].clientX);
    if (
      Math.abs(delta) < 18 ||
      horizontal > Math.abs(delta) ||
      canScrollWithin(event.target, delta)
    )
      return;
    const target = targetFor(delta);
    if (target !== undefined) {
      event.preventDefault();
      touchClaimed = true;
      go(target);
    }
  };
  const onTouchEnd = () => {
    singleTouch = false;
    touchClaimed = false;
  };
  const navigate = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return false;
    const target = id === "top" ? start : element.getBoundingClientRect().top + window.scrollY;
    go(target, id);
    return true;
  };
  const onNavigate = (event: Event) => {
    const id: unknown = (event as CustomEvent).detail;
    if (typeof id === "string" && navigate(id)) event.preventDefault();
  };
  const onAnchor = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href^='#']")
        : null;
    if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
    const id = anchor.hash.slice(1);
    if (navigate(id)) {
      event.preventDefault();
      history.pushState(null, "", anchor.hash);
    }
  };
  const onResize = () => {
    const wasInside = exposure.get() >= 0.99;
    const wasAtBoundary = Math.abs(window.scrollY - end) <= EPSILON;
    const wasEntering = destination === start;
    const wasAnimating = !!animation;
    const targetId = destinationId;
    animation?.stop();
    animation = undefined;
    measure();
    if (wasAnimating) {
      if (targetId) navigate(targetId);
      else go(wasEntering ? start : end);
    } else if (wasInside || wasAtBoundary) {
      window.scrollTo({ top: wasInside ? start : end, behavior: "instant" });
      sync();
    } else sync();
  };
  const onPolicy = () => {
    if (reduced.matches && destination !== undefined) {
      const target = destination;
      animation?.stop();
      animation = undefined;
      go(target);
    } else sync();
  };
  const onVisibility = () => {
    if (document.hidden && animation && destination !== undefined) {
      const target = destination;
      animation.stop();
      animation = undefined;
      destination = undefined;
      window.scrollTo({ top: target, behavior: "instant" });
      sync(target);
    }
  };

  measure();
  sync();
  const unsubscribePlayback = playbackReady?.on("change", () => sync());
  const observer = new ResizeObserver(onResize);
  observer.observe(hero);
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scrollend", settle);
  window.addEventListener("resize", onResize);
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("touchcancel", onTouchEnd);
  window.addEventListener(NAVIGATE_EVENT, onNavigate);
  document.addEventListener("click", onAnchor);
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", onPolicy);
  return () => {
    disposed = true;
    unsubscribePlayback?.();
    animation?.stop();
    clearTimeout(scrollTimer);
    observer.disconnect();
    content.inert = false;
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("scrollend", settle);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
    window.removeEventListener(NAVIGATE_EVENT, onNavigate);
    document.removeEventListener("click", onAnchor);
    document.removeEventListener("visibilitychange", onVisibility);
    reduced.removeEventListener("change", onPolicy);
  };
}
