import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ChevronDownIcon } from "./icons";
import { ContactForm } from "./ContactForm";
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
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailHasContent, setEmailHasContent] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Keep a stable ref so the auto-flip timer doesn't reschedule when the
  // parent passes a new function reference on each render.
  const onFlipStartRef = useRef(onFlipStart);
  onFlipStartRef.current = onFlipStart;
  const dialogCancelBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

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

  // Focus management for the discard-confirm alertdialog.
  useEffect(() => {
    if (showDiscardConfirm) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      dialogCancelBtnRef.current?.focus();
    } else if (lastFocusedRef.current) {
      lastFocusedRef.current.focus();
      lastFocusedRef.current = null;
    }
  }, [showDiscardConfirm]);

  function performFlip() {
    if (!reducedMotion) onFlipStartRef.current?.();
    setHasFlippedOnce(true);
    setFlipped((v) => !v);
  }

  function triggerFlip() {
    if (emailOpen && emailHasContent) {
      setShowDiscardConfirm(true);
      return;
    }
    performFlip();
  }

  function handleDiscardConfirm() {
    setShowDiscardConfirm(false);
    setEmailOpen(false);
    setEmailHasContent(false);
    performFlip();
  }

  const showHint = !flipped && hasFlippedOnce;

  return (
    <div className={reducedMotion ? "" : "perspective-1200"}>
      <motion.div
        className={`relative h-[540px] w-[min(calc(100vw-48px),400px)] md:h-[580px] md:w-[440px] lg:h-[640px] lg:w-[480px] ${
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
              src="/assets/brand/logos/svg/yilun-lab-mark-white.svg"
              alt=""
              className="mb-6 h-16 w-16"
            />
            <div className="font-heading text-4xl italic leading-none tracking-[-1px] text-white">
              YILUN LAB
            </div>
            <p className="mt-4 font-body text-lg italic font-light text-white/85">
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
          <div className="liquid-glass-strong liquid-glass-tint relative h-full w-full overflow-y-auto rounded-[1.5rem] p-8">
            <button
              type="button"
              onClick={triggerFlip}
              aria-label="Flip the card to view the studio brand"
              className="absolute left-2 top-2 inline-flex min-h-11 items-center px-3 py-2 font-body text-xs uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white focus-visible:text-white"
            >
              ← View card
            </button>

            {showDiscardConfirm && (
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- alertdialog with onKeyDown is correct ARIA; jsx-a11y 6.x incorrectly classifies alertdialog as non-interactive
              <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="discard-confirm-title"
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setShowDiscardConfirm(false);
                  }
                }}
                className="absolute left-4 right-4 top-12 z-10 flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-md"
              >
                <p
                  id="discard-confirm-title"
                  className="font-body text-sm text-white"
                >
                  Discard your message and flip the card?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDiscardConfirm}
                    className="liquid-glass-strong liquid-glass-tint rounded-full px-4 py-1.5 font-body text-xs font-semibold"
                  >
                    Yes, discard
                  </button>
                  <button
                    ref={dialogCancelBtnRef}
                    type="button"
                    onClick={() => setShowDiscardConfirm(false)}
                    className="rounded-full border border-white/15 px-4 py-1.5 font-body text-xs text-white/85 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="pt-10">
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

              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (emailOpen) setEmailHasContent(false);
                    setEmailOpen((v) => !v);
                  }}
                  aria-expanded={emailOpen}
                  className="font-body text-sm text-white/70 transition-colors hover:text-white focus-visible:text-white"
                >
                  {emailOpen ? "Hide email form" : "Email instead"}
                  <ChevronDownIcon
                    className={`ml-1 inline-block h-4 w-4 transition-transform ${
                      emailOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {emailOpen && (
                    <motion.div
                      key="email-expander"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: easeOut }}
                      className="overflow-hidden pt-4"
                    >
                      <ContactForm onContentChange={setEmailHasContent} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
