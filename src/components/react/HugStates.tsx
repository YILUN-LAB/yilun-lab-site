import { useState, type CSSProperties } from "react";
import { hug, type HugState } from "@lib/data/hug";

/**
 * Open / half-open / gathered selector. Choosing a state swaps the studio image
 * and shifts the surrounding glow toward that state's color temperature.
 */
export function HugStates() {
  const { items } = hug.states;
  const [activeId, setActiveId] = useState<HugState["id"]>(items[0].id);
  const active = items.find((state) => state.id === activeId) ?? items[0];

  const coolest = items[0];
  const warmest = items[items.length - 1];
  const markerPosition =
    ((coolest.kelvin - active.kelvin) / (coolest.kelvin - warmest.kelvin)) * 100;
  const glow = { "--hug-glow": active.glow } as CSSProperties;

  return (
    <div
      className="grid gap-10 [grid-template-areas:'head'_'stage'_'controls'] lg:grid-cols-[5fr_7fr] lg:gap-x-16 lg:[grid-template-areas:'head_stage'_'controls_stage']"
      style={glow}
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
        <div aria-hidden="true" className="hug-stage-glow" />
        <div className="relative mx-auto aspect-[640/890] w-full max-w-[26rem] overflow-hidden rounded-[1.25rem] bg-black/40">
          {items.map((state) => {
            const isActive = state.id === activeId;
            return (
              <img
                key={state.id}
                src={state.image.src}
                alt={isActive ? state.image.alt : ""}
                aria-hidden={isActive ? undefined : true}
                width={state.image.width}
                height={state.image.height}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="[grid-area:controls] lg:self-start">
        <div role="group" aria-label={hug.states.heading} className="grid grid-cols-3 gap-2">
          {items.map((state) => {
            const isActive = state.id === activeId;
            return (
              <button
                key={state.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveId(state.id)}
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

        <div className="mt-6" aria-hidden="true">
          <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45">
            {hug.states.scaleLabel}
          </p>
          <div
            className="relative mt-3 h-1.5 rounded-full"
            style={{
              background: `linear-gradient(90deg, rgb(${coolest.glow}), rgb(${warmest.glow}))`,
            }}
          >
            <span
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[rgb(var(--hug-glow))] shadow-[0_0_16px_rgb(var(--hug-glow))] transition-[left] duration-700 ease-out"
              style={{ left: `${markerPosition}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between font-body text-xs tabular-nums text-white/45">
            <span>{coolest.kelvin} K</span>
            <span>{warmest.kelvin} K</span>
          </div>
        </div>

        <div data-testid="hug-state-readout" aria-live="polite" className="mt-8">
          <p className="font-heading text-5xl italic tabular-nums text-[rgb(var(--hug-glow))] transition-colors duration-700 md:text-6xl">
            {active.kelvin} K
          </p>
          <p className="mt-3 font-body text-base font-light text-white/85">
            <span className="font-medium text-white">{active.name}.</span> {active.description}
          </p>
          <dl className="mt-4 font-body text-sm">
            <dt className="text-xs text-white/50">{hug.states.sizeLabel}</dt>
            <dd className="mt-1 tabular-nums text-white/85">{active.size}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
