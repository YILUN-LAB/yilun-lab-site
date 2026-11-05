import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { STATE_PROGRESS, glowAt, kelvinAt, nearestStateIndex } from "@lib/hug-opening";
import { HugModelViewer } from "./HugModelViewer";
import { useHugCopy } from "./hug-copy";

const HOLD_MS = 700;
const TWEEN_MS = 900;
const RING = 2 * Math.PI * 30;

/** Picks out the first letter of an English word; other scripts show as written. */
function Initial({ word }: { word: string }) {
  if (!/^[A-Za-z]/.test(word)) return <>{word}</>;
  return (
    <>
      <span className="text-[rgb(var(--amber-1))]">{word[0]}</span>
      {word.slice(1)}
    </>
  );
}

/**
 * The three states as one control. Unfold / Gather is a slider over the
 * opening; the state buttons snap to it; Hold switches the light. The model
 * view morphs the model shell to match, the render view shows the nearest state.
 */
export function HugStates() {
  const hug = useHugCopy();
  const { items, model, views, slider, hold } = hug.states;
  const [progress, setProgress] = useState(0);
  const [power, setPower] = useState(true);
  const [view, setView] = useState<"model" | "render">("model");
  const [modelAvailable, setModelAvailable] = useState(true);
  const [holding, setHolding] = useState(false);
  const reducedMotion = useReducedMotion();
  const tween = useRef(0);
  const holdTimer = useRef<number | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const holdHintId = useId();

  const kelvin = kelvinAt(items, progress);
  const glow = glowAt(items, progress);
  const nearest = items[nearestStateIndex(progress)];
  const activeIndex = STATE_PROGRESS.findIndex((p) => Math.abs(p - progress) < 0.001);
  const showModel = modelAvailable && view === "model";

  useEffect(
    () => () => {
      cancelAnimationFrame(tween.current);
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    []
  );

  function animateTo(to: number) {
    cancelAnimationFrame(tween.current);
    const from = progressRef.current;
    if (reducedMotion || from === to) {
      setProgress(to);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / TWEEN_MS);
      setProgress(from + (to - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) tween.current = requestAnimationFrame(step);
    };
    tween.current = requestAnimationFrame(step);
  }

  function startHold(event: React.PointerEvent) {
    if (event.button !== 0) return;
    setHolding(true);
    holdTimer.current = window.setTimeout(() => {
      setPower((on) => !on);
      setHolding(false);
      holdTimer.current = null;
    }, HOLD_MS);
  }

  function cancelHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setHolding(false);
  }

  // Keyboard and assistive-technology activation (detail 0) switches at once;
  // pointer users switch with a deliberate hold, as the lamp is meant to work.
  function onHoldClick(event: React.MouseEvent) {
    if (event.detail === 0) setPower((on) => !on);
  }

  return (
    <div
      className="grid gap-10 [grid-template-areas:'head'_'stage'_'controls'] lg:grid-cols-[5fr_7fr] lg:gap-x-16 lg:[grid-template-areas:'head_stage'_'controls_stage']"
      style={{ "--hug-glow": glow } as CSSProperties}
    >
      <div className="[grid-area:head] lg:self-end">
        <p className="mb-4 font-body text-sm text-white/70">// {hug.states.kicker}</p>
        <h2
          id="hug-states"
          className="font-heading text-4xl italic leading-[0.95] tracking-[-1px] md:text-6xl"
        >
          {hug.states.heading}
        </h2>
        <p className="mt-6 max-w-md font-body text-base font-light leading-relaxed text-white/80">
          {hug.states.intro}
        </p>
      </div>

      <div className="relative [grid-area:stage]">
        <div
          aria-hidden="true"
          className="hug-stage-glow transition-opacity duration-700"
          style={{ opacity: power ? 1 : 0.12 }}
        />
        <div className="relative mx-auto w-full max-w-[30rem]">
          {modelAvailable && (
            <div role="group" aria-label={views.label} className="mb-3 flex justify-end gap-1">
              {(["model", "render"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={view === option}
                  onClick={() => setView(option)}
                  className={`rounded-full px-3 py-1 font-body text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 ${
                    view === option ? "bg-white/15 text-white" : "text-white/55 hover:text-white/85"
                  }`}
                >
                  {views[option]}
                </button>
              ))}
            </div>
          )}
          <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-black/40 sm:aspect-[4/5]">
            {modelAvailable && (
              <div
                aria-hidden={showModel ? undefined : true}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  showModel ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <HugModelViewer
                  src={model.src}
                  progress={progress}
                  glow={glow}
                  power={power}
                  active={showModel}
                  label={model.label}
                  hint={model.hint}
                  loading={model.loading}
                  dimensionLabel={model.dimension}
                  turnLeft={model.turnLeft}
                  turnRight={model.turnRight}
                  onUnavailable={() => setModelAvailable(false)}
                />
              </div>
            )}
            <div
              aria-hidden={showModel ? true : undefined}
              className={`absolute inset-0 transition-opacity duration-500 ${
                showModel ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              {items.map((state) => {
                const isNearest = state.id === nearest.id;
                return (
                  <img
                    key={state.id}
                    src={state.image.src}
                    alt={isNearest ? state.image.alt : ""}
                    aria-hidden={isNearest ? undefined : true}
                    width={state.image.width}
                    height={state.image.height}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                      isNearest ? "opacity-100" : "opacity-0"
                    }`}
                  />
                );
              })}
            </div>
          </div>
          <p className="mt-3 font-body text-xs leading-relaxed text-white/50">
            {showModel ? model.note : hug.states.renderNote}
          </p>
        </div>
      </div>

      <div className="[grid-area:controls] lg:self-start">
        <div role="group" aria-label={hug.states.heading} className="grid grid-cols-3 gap-2">
          {items.map((state, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={state.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => animateTo(STATE_PROGRESS[index])}
                className={`rounded-[1rem] border px-3 py-3 text-left font-body transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 md:px-4 ${
                  isActive
                    ? "border-white/45 bg-white/10 text-white"
                    : "border-white/10 text-white/70 hover:border-white/25 hover:text-white"
                }`}
              >
                <span className="block text-sm font-medium">{state.name}</span>{" "}
                <span className="block text-xs tabular-nums text-white/55">{state.kelvin} K</span>
              </button>
            );
          })}
        </div>

        <div className="mt-7">
          <div className="flex justify-between font-heading text-lg italic text-white/80">
            <span>
              <Initial word={slider.start} />
            </span>
            <span>
              <Initial word={slider.end} />
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(progress * 100)}
            onChange={(event) => {
              cancelAnimationFrame(tween.current);
              setProgress(Number(event.target.value) / 100);
            }}
            aria-label={slider.label}
            aria-valuetext={`${nearest.name}, ${kelvin} K`}
            className="hug-range mt-2 w-full"
            style={
              {
                "--hug-from": `rgb(${items[0].glow})`,
                "--hug-to": `rgb(${items[items.length - 1].glow})`,
              } as CSSProperties
            }
          />
          <div className="mt-1 flex justify-between font-body text-xs tabular-nums text-white/45">
            <span>{items[0].kelvin} K</span>
            <span>{items[items.length - 1].kelvin} K</span>
          </div>
        </div>

        <div className="mt-8 flex items-start justify-between gap-6">
          <div data-testid="hug-state-readout">
            <p
              className={`font-heading text-5xl italic tabular-nums md:text-6xl ${
                power ? "text-[rgb(var(--hug-glow))]" : "text-white/55"
              }`}
            >
              {power ? `${kelvin} K` : hold.off}
            </p>
            <p className="mt-3 font-body text-base font-light text-white/85">
              <span className="font-medium text-white">{nearest.name}</span>
              {hug.states.nameStop}
              {nearest.description}
            </p>
            <dl className="mt-4 font-body text-sm">
              <dt className="text-xs text-white/50">{hug.states.sizeLabel}</dt>
              <dd className="mt-1 tabular-nums text-white/85">{nearest.size}</dd>
            </dl>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-2">
            <button
              type="button"
              aria-label={hold.label}
              aria-pressed={power}
              aria-describedby={holdHintId}
              onPointerDown={startHold}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              onPointerCancel={cancelHold}
              onClick={onHoldClick}
              onContextMenu={(event) => event.preventDefault()}
              className="relative flex h-[4.5rem] w-[4.5rem] touch-none select-none items-center justify-center rounded-full font-heading text-xl italic text-white [-webkit-touch-callout:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
            >
              <svg aria-hidden="true" viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
                <circle cx="32" cy="32" r="30" fill="none" stroke="rgb(255 255 255 / 0.18)" />
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  fill="none"
                  stroke="rgb(var(--amber-1))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={RING}
                  strokeDashoffset={holding ? 0 : RING}
                  style={{
                    transition: holding
                      ? `stroke-dashoffset ${HOLD_MS}ms linear`
                      : "stroke-dashoffset 200ms ease-out",
                  }}
                />
              </svg>
              <span className={power ? "" : "opacity-60"}>
                <Initial word={hold.label} />
              </span>
            </button>
            <p
              id={holdHintId}
              className="max-w-[7rem] text-center font-body text-[11px] text-white/50"
            >
              {power ? hold.hintOn : hold.hintOff}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
