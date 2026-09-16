import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface LightboxPhoto {
  src: string;
  fullSrc?: string;
  alt: string;
}

export interface LightboxLabels {
  title: string;
  open: string;
  close: string;
  previous: string;
  next: string;
  loading: string;
  unavailable: string;
}

interface PhotoLightboxProps {
  title: string;
  photos: LightboxPhoto[];
  initialIndex: number;
  labels?: LightboxLabels;
  onClose: () => void;
}

export const photoLightboxLabels: LightboxLabels = {
  title: "Project photographs",
  open: "View photograph",
  close: "Close image viewer",
  previous: "Previous photograph",
  next: "Next photograph",
  loading: "Loading image…",
  unavailable: "Full-size image unavailable. Showing preview.",
};

function FullSizePhoto({ photo, labels }: { photo: LightboxPhoto; labels: LightboxLabels }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imageClass =
    "pointer-events-auto absolute inset-0 m-auto h-auto max-h-full w-auto max-w-full select-none object-contain";

  return (
    <>
      <img src={photo.src} alt={photo.alt} draggable={false} className={imageClass} />
      {photo.fullSrc && !failed && (
        <img
          src={photo.fullSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`${imageClass} ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
      <p role="status" className="absolute inset-x-0 bottom-2 text-center text-xs text-white/70">
        {failed ? labels.unavailable : photo.fullSrc && !loaded ? labels.loading : ""}
      </p>
    </>
  );
}

export function PhotoLightbox({
  title,
  photos,
  initialIndex,
  labels = photoLightboxLabels,
  onClose,
}: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState(initialIndex);
  const reducedMotion = useReducedMotion();
  const photo = photos[index];
  const move = (direction: number) =>
    setIndex((current) => (current + direction + photos.length) % photos.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    dialog.showModal();
    dialog
      .querySelector<HTMLButtonElement>("[data-lightbox-close]")
      ?.focus({ preventScroll: true });
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  const controlClass =
    "pointer-events-auto inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200";

  return (
    <dialog
      ref={dialogRef}
      aria-label={labels.title}
      aria-modal="true"
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-black/95 p-0 text-white backdrop:bg-black/80"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === "Tab") {
          const controls = event.currentTarget.querySelectorAll<HTMLButtonElement>(
            "button:not([tabindex='-1'])"
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          event.stopPropagation();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={labels.close}
        className="absolute inset-0 cursor-zoom-out"
        onClick={onClose}
      />
      <div className="pointer-events-none relative grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:gap-6 md:px-8 md:py-6">
        <header className="flex items-center justify-between gap-4">
          <p className="min-w-0 font-heading text-2xl italic md:text-3xl">{title}</p>
          <button
            data-lightbox-close
            type="button"
            aria-label={labels.close}
            className={controlClass}
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <motion.div
          key={photo.src}
          initial={reducedMotion ? false : { opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
          className="relative min-h-0 touch-pan-y touch-pinch-zoom md:mx-16"
          onTouchStart={(event) => {
            touchStart.current =
              event.touches.length === 1
                ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
                : null;
          }}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start || event.touches.length || !event.changedTouches[0]) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
          }}
        >
          <FullSizePhoto photo={photo} labels={labels} />
        </motion.div>
        <footer className="flex items-center justify-between gap-4">
          <button
            type="button"
            aria-label={labels.previous}
            className={controlClass}
            onClick={() => move(-1)}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="m14 5-7 7 7 7" />
            </svg>
          </button>
          <div className="min-w-0 max-w-2xl text-center font-body">
            <p aria-live="polite" aria-atomic="true" className="text-sm tabular-nums text-white/80">
              {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </p>
          </div>
          <button
            type="button"
            aria-label={labels.next}
            className={controlClass}
            onClick={() => move(1)}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="m10 5 7 7-7 7" />
            </svg>
          </button>
        </footer>
      </div>
    </dialog>
  );
}
