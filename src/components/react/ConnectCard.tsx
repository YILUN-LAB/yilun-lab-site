import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, MailIcon } from "./icons";
import { easeOut } from "@lib/motion-presets";
import { SOCIAL_LINKS } from "@lib/data/social-links";

const AUTO_FLIP_DELAY_MS = 1500;
const FLIP_DURATION_S = 0.9;

// React 18.3 warns when a `boolean | undefined` is passed to `inert`
// because the attribute isn't yet in its DOM property registry. Spreading
// `{ inert: "" }` (the HTML boolean-attribute convention) sidesteps the
// warning without a type cast.
const inertAttr = (active: boolean) =>
  active ? ({ inert: "" } as Record<string, string>) : undefined;

interface ConnectCardProps {
  /** Fires synchronously at the start of every flip (auto or manual).
   *  Used by the parent to trigger the catch-the-light pulse. */
  onFlipStart?: () => void;
}

export function ConnectCard({ onFlipStart }: ConnectCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [hasFlippedOnce, setHasFlippedOnce] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Keep a stable ref so the auto-flip timer doesn't reschedule when the
  // parent passes a new function reference on each render.
  const onFlipStartRef = useRef(onFlipStart);
  onFlipStartRef.current = onFlipStart;

  // Initial state is false (matches SSR). On mount, if reduced motion is set,
  // we land directly on the back face instead of running the auto-flip + rotation.
  // Listens for runtime OS setting changes (e.g. DevTools mid-session).
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      setReducedMotion(true);
      setFlipped(true);
      setHasFlippedOnce(true);
    }
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // One-shot auto-flip on first mount only.
  useEffect(() => {
    if (reducedMotion || hasFlippedOnce) return;
    const t = setTimeout(() => {
      onFlipStartRef.current?.();
      setHasFlippedOnce(true);
      setFlipped(true);
    }, AUTO_FLIP_DELAY_MS);
    return () => clearTimeout(t);
  }, [reducedMotion, hasFlippedOnce]);

  function triggerFlip() {
    // Block manual flips before the initial auto-flip has fired so every
    // visitor sees the entrance rotation animation. Under reduced motion
    // hasFlippedOnce is set synchronously by the detection effect, so the
    // gate releases on first paint.
    if (!hasFlippedOnce) return;
    if (!reducedMotion) onFlipStartRef.current?.();
    setFlipped((v) => !v);
  }

  const showHint = !flipped && hasFlippedOnce;

  return (
    <div className={reducedMotion ? "" : "perspective-1200"}>
      <motion.div
        className={`relative h-[440px] w-[min(calc(100vw-48px),400px)] md:h-[480px] md:w-[440px] lg:h-[540px] lg:w-[480px] ${
          reducedMotion ? "" : "preserve-3d"
        }`}
        animate={reducedMotion ? undefined : { rotateY: flipped ? 180 : 0 }}
        transition={
          reducedMotion
            ? undefined
            : { duration: FLIP_DURATION_S, ease: [0.2, 0.9, 0.2, 1] }
        }
      >
        {/* FRONT FACE */}
        <motion.div
          className={`absolute inset-0 ${reducedMotion ? "" : "backface-hidden"}`}
          animate={reducedMotion ? { opacity: flipped ? 0 : 1 } : undefined}
          transition={
            reducedMotion ? { duration: 0.25, ease: easeOut } : undefined
          }
          {...inertAttr(flipped)}
        >
          <button
            type="button"
            onClick={triggerFlip}
            aria-label="Flip the card to view social links"
            className="liquid-glass-strong liquid-glass-tint flex h-full w-full flex-col items-center justify-center rounded-[1.5rem] p-10 text-center"
          >
            <img
              src="/assets/brand/logos/svg/yilun-lab-lockup-stacked-white.svg"
              alt="Yilun Lab"
              className="h-32 w-auto"
            />
            <p className="mt-6 font-body text-lg italic font-light text-white/85">
              Light. Emotion. Future.
            </p>
            <div className="my-8 h-px w-16 bg-white/20" />
            <p className="font-body text-sm italic font-light text-white/65">
              To you, from the studio.
            </p>
            {showHint && !reducedMotion && (
              <p className="mt-6 font-body text-xs uppercase tracking-[0.18em] text-white/45">
                Tap to flip ↻
              </p>
            )}
          </button>
        </motion.div>

        {/* BACK FACE */}
        <motion.div
          className={`absolute inset-0 ${reducedMotion ? "" : "backface-hidden"}`}
          style={reducedMotion ? undefined : { transform: "rotateY(180deg)" }}
          animate={reducedMotion ? { opacity: flipped ? 1 : 0 } : undefined}
          transition={
            reducedMotion ? { duration: 0.25, ease: easeOut } : undefined
          }
          {...inertAttr(!flipped)}
        >
          <div className="liquid-glass-strong liquid-glass-tint relative flex h-full w-full flex-col justify-center rounded-[1.5rem] px-8 pb-8 pt-14">
            <button
              type="button"
              onClick={triggerFlip}
              aria-label="Flip the card to view the studio brand"
              className="absolute left-2 top-2 inline-flex min-h-11 items-center px-3 py-2 font-body text-xs uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white focus-visible:text-white"
            >
              ← View card
            </button>

            <div>
              <div className="mb-4 font-body text-sm text-white/80">
                // Follow the lab
              </div>

              <ul className="flex flex-col gap-3">
                {SOCIAL_LINKS.map(({ id, label, platform, href, Icon }) => (
                  <li key={id}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Find Yilun Lab on ${platform}`}
                      className="liquid-glass-strong liquid-glass-tint flex h-14 w-full items-center justify-between gap-3 rounded-full px-5 md:h-16"
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1 text-center font-body text-sm font-semibold uppercase tracking-[0.16em]">
                        {label}
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>

              <div className="my-6 h-px w-full bg-white/10" />

              <a
                href="/contact#get-in-touch"
                className="group inline-flex items-center gap-2 font-body text-sm text-white/65 transition-colors hover:text-white focus-visible:text-white"
              >
                <MailIcon className="h-4 w-4 shrink-0" />
                <span>Or write to us</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
