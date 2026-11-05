import "lite-youtube-embed/src/lite-yt-embed.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import { fadeBlurIn } from "@lib/motion-presets";
import { useActiveSection } from "@lib/use-active-section";
import { hug } from "@lib/data/hug";
import { PhotoLightbox, type LightboxPhoto } from "./PhotoLightbox";
import { ArrowUpRight } from "./icons";
import { HugStates } from "./HugStates";
import { HugDayStrip, type HugScene } from "./HugDayStrip";
import { HugLaminateDiagram } from "./HugLaminateDiagram";
import { HugZoomImage } from "./HugZoomImage";

interface HugProjectProps {
  scenes: HugScene[];
  next: { title: string; href: string };
}

const section = "relative px-8 py-16 md:px-16 md:py-24 lg:px-20";
const kicker = "mb-4 font-body text-sm text-white/70";
const bodyText = "font-body text-base font-light leading-relaxed text-white/80 md:text-[1.0625rem]";
const termClass = "font-body text-sm font-medium text-white";
const criterionIds = hug.criteria.map((criterion) => `hug-${criterion.id}`);

function uniqueBySrc(photos: LightboxPhoto[]) {
  return photos.filter((photo, index) => photos.findIndex((p) => p.src === photo.src) === index);
}

function Placeholder({ label, className }: { label: string; className: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-[1rem] border border-dashed border-white/20 bg-white/[0.02] px-4 text-center font-body text-xs text-white/45 ${className}`}
    >
      {label}
    </div>
  );
}

export function HugProject({ scenes, next }: HugProjectProps) {
  // Same props on server and client; MotionConfig drops movement for reduced motion.
  const reveal = fadeBlurIn(0);
  const activeCriterion = useActiveSection(criterionIds);
  const { development } = hug;

  const drawings = development.drawings;
  const photos = useMemo(
    () =>
      uniqueBySrc([
        hug.hero,
        ...scenes,
        hug.states.lineup,
        hug.idea.image,
        hug.form.embrace,
        hug.form.edge,
        hug.form.base,
        hug.differentiation.day.image,
        hug.differentiation.night.image,
        ...drawings.flatMap((d) => (d.src ? [{ src: d.src, alt: d.alt ?? d.label }] : [])),
      ]),
    [scenes, drawings]
  );
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const openPhoto = useCallback(
    (src: string) => {
      const index = photos.findIndex((photo) => photo.src === src);
      if (index >= 0) setActivePhoto(index);
    },
    [photos]
  );
  const closePhoto = useCallback(() => setActivePhoto(null), []);

  const [embedReady, setEmbedReady] = useState(false);
  useEffect(() => {
    if (!development.youtube) return;
    let cancelled = false;
    import("lite-youtube-embed").then(() => {
      if (!cancelled) setEmbedReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [development.youtube]);

  function criterionVisual(id: string) {
    switch (id) {
      case "idea":
        return (
          <figure>
            <HugZoomImage image={hug.idea.image} onOpen={openPhoto} className="rounded-[1.25rem]" />
            <figcaption className="mt-3 font-body text-sm text-white/55">
              {hug.idea.caption}
            </figcaption>
          </figure>
        );
      case "form":
        return (
          <div className="space-y-3">
            <HugZoomImage
              image={hug.form.embrace}
              onOpen={openPhoto}
              className="rounded-[1.25rem]"
            />
            <div className="grid grid-cols-2 gap-3">
              <HugZoomImage
                image={hug.form.edge}
                onOpen={openPhoto}
                aspectClass="aspect-[4/3]"
                className="rounded-[1rem]"
              />
              <HugZoomImage
                image={hug.form.base}
                onOpen={openPhoto}
                aspectClass="aspect-[4/3]"
                className="rounded-[1rem]"
              />
            </div>
          </div>
        );
      case "function":
        return <HugLaminateDiagram />;
      case "differentiation":
        return (
          <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
            {[hug.differentiation.day, hug.differentiation.night].map((moment) => (
              <figure key={moment.label}>
                <HugZoomImage
                  image={moment.image}
                  onOpen={openPhoto}
                  className="rounded-[1.25rem]"
                />
                <figcaption className="mt-3 font-body text-sm text-white/70">
                  <span className="mr-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                    {moment.label}
                  </span>
                  {moment.text}
                </figcaption>
              </figure>
            ))}
          </div>
        );
      case "sustainability":
        return (
          <div className="space-y-4 md:space-y-5">
            <ul className="grid gap-3 sm:grid-cols-3 md:gap-5">
              {hug.sustainability.strategies.map((strategy) => (
                <li key={strategy.term} className="liquid-glass rounded-[1.25rem] p-5">
                  <span
                    aria-hidden="true"
                    className="mb-4 block h-2 w-2 rounded-full bg-[rgb(var(--amber-1))] shadow-[0_0_12px_rgb(var(--amber-1))]"
                  />
                  <p className={termClass}>{strategy.term}</p>
                  <p className="mt-2 font-body text-sm font-light leading-relaxed text-white/70">
                    {strategy.text}
                  </p>
                </li>
              ))}
            </ul>
            <div className="rounded-[1.25rem] border border-white/10 p-5 md:flex md:gap-8">
              <p className="shrink-0 font-body text-[11px] uppercase tracking-[0.18em] text-white/45 md:w-40 md:pt-0.5">
                {hug.sustainability.limitsLabel}
              </p>
              <p className="mt-3 max-w-2xl font-body text-sm font-light leading-relaxed text-white/70 md:mt-0">
                {hug.sustainability.limits}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  function criterionExtras(id: string) {
    if (id === "form") {
      return (
        <dl className="mt-8 space-y-5 border-t border-white/10 pt-6">
          {hug.form.details.map((detail) => (
            <div key={detail.term}>
              <dt className={termClass}>{detail.term}</dt>
              <dd className="mt-1 font-body text-sm font-light leading-relaxed text-white/70">
                {detail.text}
              </dd>
            </div>
          ))}
        </dl>
      );
    }
    if (id === "function") {
      return (
        <>
          <dl className="mt-8 space-y-5 border-t border-white/10 pt-6">
            {hug.function.specs.map((spec) => (
              <div key={spec.term}>
                <dt className={termClass}>{spec.term}</dt>
                <dd className="mt-1 font-body text-sm font-light leading-relaxed text-white/70">
                  {spec.text}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 font-body text-xs leading-relaxed text-white/50">
            {hug.function.validation}
          </p>
        </>
      );
    }
    return null;
  }

  return (
    <MotionConfig reducedMotion="user">
      <article className="hug relative isolate overflow-hidden pb-20 pt-28 text-white">
        {/* Hero */}
        <header className="relative px-8 pb-12 md:px-16 lg:px-20">
          <div aria-hidden="true" className="hug-aura" />
          <div className="relative mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5 lg:pb-4">
              <p className="mb-4 font-body text-sm text-white/80">// {hug.eyebrow}</p>
              {/* mb in em clears the g descender (~0.22em) at every title size. */}
              <h1 className="mb-[0.26em] font-heading text-[6rem] italic leading-[0.8] tracking-[-4px] md:text-[9rem] lg:text-[10.5rem]">
                {hug.title}
              </h1>
              <p className="font-heading text-2xl italic text-white/85 md:text-3xl">
                {hug.subtitle}
              </p>
              <p className="mt-6 max-w-md font-body text-base font-light leading-relaxed text-white/80 md:text-lg">
                {hug.lede}
              </p>
              <p className="mt-8 font-body text-xs uppercase tracking-[0.22em] text-white/50">
                {hug.meta.join(" · ")}
              </p>
              <p className="mt-4 inline-flex rounded-full border border-white/15 px-3 py-1.5 font-body text-[11px] uppercase tracking-[0.16em] text-white/65">
                {hug.award}
              </p>
            </div>
            <figure className="relative lg:col-span-7">
              <HugZoomImage
                image={hug.hero}
                onOpen={openPhoto}
                eager
                className="rounded-[1.5rem]"
              />
            </figure>
          </div>

          <dl
            aria-label={hug.labels.facts}
            className="relative mx-auto mt-14 grid max-w-6xl grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-8 md:grid-cols-3 lg:grid-cols-6"
          >
            {hug.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {fact.label}
                </dt>
                <dd className="mt-2 font-body text-sm leading-snug text-white/85">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* Statement */}
        <section aria-labelledby="hug-about" className={section}>
          <motion.div {...reveal} className="mx-auto max-w-4xl text-center">
            <h2 id="hug-about" className={kicker}>
              // {hug.labels.about}
            </h2>
            <p className="font-heading text-3xl italic leading-[1.1] tracking-[-0.5px] md:text-5xl">
              {hug.statement.lead}
            </p>
            <div className={`mx-auto mt-10 max-w-2xl space-y-5 text-left ${bodyText} md:text-lg`}>
              {hug.statement.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Three gestures. The initials spell the name; the page leaves that to be noticed. */}
        <section aria-labelledby="hug-gestures" className="relative px-8 py-8 md:px-16 lg:px-20">
          <h2 id="hug-gestures" className="sr-only">
            {hug.gesturesLabel}
          </h2>
          <ol className="mx-auto grid max-w-6xl gap-10 border-y border-white/10 py-12 md:grid-cols-3 md:gap-12 md:py-16">
            {hug.gestures.map((gesture) => (
              <motion.li key={gesture.word} {...reveal}>
                <p className="font-heading text-5xl italic leading-none tracking-[-1px] md:text-6xl">
                  <span className="text-[rgb(var(--amber-1))]">{gesture.word[0]}</span>
                  {gesture.word.slice(1)}
                </p>
                <p className="mt-5 max-w-xs font-body text-sm font-light leading-relaxed text-white/65">
                  {gesture.text}
                </p>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Three states */}
        <section aria-labelledby="hug-states" className={section}>
          <div className="mx-auto max-w-6xl">
            <HugStates />
            <motion.figure {...reveal} className="mt-16 md:mt-24">
              <HugZoomImage
                image={hug.states.lineup}
                onOpen={openPhoto}
                className="rounded-[1.5rem]"
              />
              <figcaption className="mt-3 font-body text-sm text-white/55">
                {hug.states.lineupCaption}
              </figcaption>
            </motion.figure>
          </div>
        </section>

        {/* A day with Hug */}
        <section aria-labelledby="hug-day" className="relative py-16 md:py-24">
          <div className="mx-auto mb-10 max-w-6xl px-8 md:px-16 lg:box-content lg:px-20">
            <p className={kicker}>// {hug.day.kicker}</p>
            <div className="grid gap-6 md:grid-cols-2 md:items-end">
              <h2
                id="hug-day"
                className="font-heading text-4xl italic leading-[0.95] tracking-[-1px] md:text-6xl"
              >
                {hug.day.heading}
              </h2>
              <p className={`max-w-md md:justify-self-end ${bodyText}`}>{hug.day.intro}</p>
            </div>
          </div>
          <HugDayStrip scenes={scenes} onOpen={openPhoto} />
        </section>

        {/* iF criteria */}
        <section aria-labelledby="hug-criteria" className={section}>
          <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-16">
            <nav aria-label={hug.labels.criteria} className="hidden lg:block">
              <ol className="sticky top-32 space-y-1 font-body text-sm">
                {hug.criteria.map((criterion, index) => {
                  const isActive = activeCriterion === `hug-${criterion.id}`;
                  return (
                    <li key={criterion.id}>
                      <a
                        href={`#hug-${criterion.id}`}
                        aria-current={isActive ? "true" : undefined}
                        className={`flex gap-3 rounded-full py-1.5 transition-colors ${
                          isActive ? "text-white" : "text-white/45 hover:text-white/80"
                        }`}
                      >
                        <span className="tabular-nums text-white/35">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {criterion.label}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="space-y-24 md:space-y-32">
              <h2 id="hug-criteria" className="sr-only">
                {hug.labels.criteria}
              </h2>
              {hug.criteria.map((criterion, index) => {
                const wide =
                  criterion.id === "differentiation" || criterion.id === "sustainability";
                return (
                  <section
                    key={criterion.id}
                    id={`hug-${criterion.id}`}
                    aria-labelledby={`hug-${criterion.id}-title`}
                    className="scroll-mt-28"
                  >
                    <p className={kicker}>
                      <span className="tabular-nums text-white/40">
                        {String(index + 1).padStart(2, "0")}
                      </span>{" "}
                      / {criterion.label}
                    </p>
                    <h3
                      id={`hug-${criterion.id}-title`}
                      className="max-w-3xl font-heading text-4xl italic leading-[0.95] tracking-[-1px] md:text-[3.5rem]"
                    >
                      {criterion.heading}
                    </h3>
                    {wide ? (
                      <>
                        <div className={`mt-8 max-w-2xl space-y-4 ${bodyText}`}>
                          {criterion.body.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                        <motion.div {...reveal} className="mt-10">
                          {criterionVisual(criterion.id)}
                        </motion.div>
                      </>
                    ) : (
                      <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-12">
                        <div className="md:col-span-5">
                          <div className={`space-y-4 ${bodyText}`}>
                            {criterion.body.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                          </div>
                          {criterionExtras(criterion.id)}
                        </div>
                        <motion.div {...reveal} className="md:col-span-7">
                          {criterionVisual(criterion.id)}
                        </motion.div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </section>

        {/* Development, drawings, film */}
        <section aria-labelledby="hug-development" className={section}>
          <div className="mx-auto max-w-6xl">
            <p className={kicker}>// {development.kicker}</p>
            <h2
              id="hug-development"
              className="font-heading text-4xl italic leading-[0.95] tracking-[-1px] md:text-6xl"
            >
              {development.heading}
            </h2>
            <p className={`mt-6 max-w-2xl ${bodyText}`}>{development.intro}</p>

            <ol className="mt-12 grid gap-6 border-t border-white/10 pt-8 md:grid-cols-3">
              {development.steps.map((step, index) => (
                <li key={step.term}>
                  <span className="font-body text-xs tabular-nums text-white/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className={`mt-2 ${termClass}`}>{step.term}</p>
                  <p className="mt-1 font-body text-sm font-light text-white/70">{step.text}</p>
                </li>
              ))}
            </ol>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-4">
                <table className="w-full font-body text-sm">
                  <caption className="mb-4 text-left text-[11px] uppercase tracking-[0.18em] text-white/45">
                    {development.sizesLabel}
                  </caption>
                  <tbody>
                    {hug.states.items.map((state) => (
                      <tr key={state.id} className="border-t border-white/10">
                        <th scope="row" className="py-3 pr-4 text-left font-medium text-white">
                          {state.name}
                        </th>
                        <td className="py-3 text-right tabular-nums text-white/80">{state.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 border-t border-white/10 pt-4 font-body text-xs leading-relaxed text-white/55">
                  {development.massNote}
                </p>
              </div>

              <div className="lg:col-span-8">
                <p className="mb-4 font-body text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {development.drawingsLabel}
                </p>
                <ul className="grid gap-3 sm:grid-cols-3">
                  {drawings.map((drawing) => (
                    <li key={drawing.label}>
                      <figure>
                        {drawing.src ? (
                          <div className="rounded-[1rem] bg-[#f4efe8] p-3">
                            <HugZoomImage
                              image={{
                                src: drawing.src,
                                alt: drawing.alt ?? drawing.label,
                                width: drawing.width,
                                height: drawing.height,
                              }}
                              onOpen={openPhoto}
                            />
                          </div>
                        ) : (
                          <Placeholder
                            label={development.placeholder}
                            className="aspect-[16/7] sm:aspect-[4/3]"
                          />
                        )}
                        <figcaption className="mt-2 font-body text-sm text-white/70">
                          {drawing.label}
                        </figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-16">
              <p className="mb-4 font-body text-[11px] uppercase tracking-[0.18em] text-white/45">
                {development.filmLabel}
              </p>
              {development.youtube ? (
                <div className="liquid-glass relative aspect-video overflow-hidden rounded-[1.25rem]">
                  {embedReady && (
                    <lite-youtube videoid={development.youtube} class="h-full w-full" />
                  )}
                </div>
              ) : (
                <Placeholder label={development.filmPlaceholder} className="h-36 md:h-44" />
              )}
            </div>

            <div className="liquid-glass mt-16 grid gap-8 rounded-[1.25rem] p-6 md:grid-cols-[2fr_1fr] md:p-8">
              <div>
                <h3 className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {development.statusLabel}
                </h3>
                <p className="mt-3 font-body text-sm font-light leading-relaxed text-white/80 md:text-base">
                  {development.status}
                </p>
              </div>
              <dl className="space-y-4 font-body text-sm">
                {hug.credits.map((credit) => (
                  <div key={credit.label}>
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      {credit.label}
                    </dt>
                    <dd className="mt-1 text-white/85">{credit.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <nav
          aria-label={hug.labels.nextWork}
          className="mx-auto mt-4 max-w-6xl px-8 md:box-content md:px-16 lg:px-20"
        >
          <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-10">
            <span className="font-body text-xs uppercase tracking-[0.18em] text-white/55">
              {hug.labels.nextWork}
            </span>
            <a
              href={next.href}
              className="liquid-glass-strong liquid-glass-tint inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              {next.title} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </nav>

        {activePhoto !== null && (
          <PhotoLightbox
            title={hug.title}
            photos={photos}
            initialIndex={activePhoto}
            onClose={closePhoto}
          />
        )}
      </article>
    </MotionConfig>
  );
}
