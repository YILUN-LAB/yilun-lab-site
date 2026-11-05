import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { hug } from "@lib/data/hug";
import { HugZoomImage } from "./HugZoomImage";

export interface HugScene {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

const edge = "px-8 md:px-16 lg:px-[max(5rem,calc((100vw-72rem)/2))]";
const snapEdge = "scroll-px-8 md:scroll-px-16 lg:scroll-px-[max(5rem,calc((100vw-72rem)/2))]";

/** Scene renders in their morning-to-night order, scrolled sideways. */
export function HugDayStrip({
  scenes,
  onOpen,
}: {
  scenes: HugScene[];
  onOpen: (src: string) => void;
}) {
  const scroller = useRef<HTMLUListElement>(null);
  const reducedMotion = useReducedMotion();

  function scrollBy(direction: 1 | -1) {
    const element = scroller.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.8,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <div className="relative">
      <ul
        ref={scroller}
        className={`hug-strip flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 md:gap-5 ${edge} ${snapEdge}`}
      >
        {scenes.map((scene, index) => (
          <li
            key={scene.src}
            className="w-[82vw] shrink-0 snap-start sm:w-[60vw] md:w-[46vw] lg:w-[34rem]"
          >
            <figure>
              <HugZoomImage image={scene} onOpen={onOpen} className="rounded-[1rem]" />
              {scene.caption && (
                <figcaption className="mt-3 flex gap-3 font-body text-sm text-white/75">
                  <span className="tabular-nums text-white/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {scene.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
      <div className={`mt-2 hidden justify-end gap-2 md:flex ${edge}`}>
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={hug.day.previous}
          className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full text-white/85"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={hug.day.next}
          className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full text-white/85"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
