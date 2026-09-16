import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { fadeBlurIn } from "@lib/motion-presets";
import { PhotoLightbox } from "./PhotoLightbox";
import { PillTabs } from "./PillTabs";
import { ArrowUpRight } from "./icons";
import {
  softBoundary,
  softBoundaryInquiryUrl,
  softBoundarySourceUrl,
  type ExhibitionLanguage,
} from "@lib/data/soft-boundary";

interface SoftBoundaryProjectProps {
  cover?: string;
  coverFullSrc?: string;
  images: Array<{
    src: string;
    fullSrc?: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
  }>;
  next: { title: string; href: string };
}

const flyer = "/assets/images/projects/soft-boundary/exhibition-flyer.webp";
const linkClass =
  "inline-flex items-center gap-2 border-b border-white/35 pb-1 text-sm text-white/85 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200";

export function SoftBoundaryProject({
  cover,
  coverFullSrc,
  images,
  next,
}: SoftBoundaryProjectProps) {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setActivePhoto(null), []);
  const [language, setLanguage] = useState<ExhibitionLanguage>("en");

  useEffect(() => {
    setLanguage(navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en");
  }, []);

  const copy = softBoundary[language];
  const photos = [
    ...(cover ? [{ src: cover, fullSrc: coverFullSrc, alt: copy.coverAlt }] : []),
    ...images.map((image, index) => ({ ...image, alt: copy.imageAlts[index] ?? image.alt })),
  ];
  const reducedMotion = useReducedMotion();
  const reveal = reducedMotion ? {} : fadeBlurIn(0);

  return (
    <article
      lang={language}
      className="soft-boundary relative isolate overflow-hidden bg-black pb-20 pt-28 text-white"
    >
      <header className="relative px-8 pb-12 md:px-16 lg:px-20">
        <div aria-hidden="true" className="soft-boundary-aura" />
        <div aria-hidden="true" className="soft-boundary-veil" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <p className="font-body text-sm text-white/80">
              // {language === "ja" ? "光とアート" : "Light & Art"}
            </p>
            <div role="group" aria-label={copy.labels.language}>
              <PillTabs
                tabs={[
                  { id: "en", label: "English" },
                  { id: "ja", label: "日本語" },
                ]}
                activeId={language}
                onChange={(id) => setLanguage(id as ExhibitionLanguage)}
              />
            </div>
          </div>
          <h1
            className={
              language === "ja"
                ? "font-body text-[2.5rem] font-light leading-[1.2] tracking-tight md:text-6xl lg:text-7xl"
                : "font-heading text-5xl italic leading-[0.85] tracking-[-3px] md:text-7xl lg:text-[7rem]"
            }
          >
            {copy.title}
          </h1>
          <p
            lang={language === "en" ? "ja" : "en"}
            className={
              language === "ja"
                ? "mt-3 font-heading text-2xl italic text-white/80 md:text-3xl"
                : "mt-3 font-body text-xl font-light text-white/80 md:text-2xl"
            }
          >
            {copy.subtitle}
          </p>
          <p className="mt-6 max-w-2xl font-body text-base font-light leading-relaxed text-white/85 md:text-lg">
            {copy.summary}
          </p>
          <p className="mt-8 font-body text-xs uppercase tracking-[0.22em] text-white/55">
            2026 · {copy.eyebrow}
          </p>
        </div>
      </header>

      <div className="relative px-8 py-12 md:px-16 lg:px-20">
        <div className="mx-auto max-w-6xl">
          {cover && (
            <motion.figure {...reveal} className="relative">
              <button
                type="button"
                aria-label={`${copy.lightbox.open}: ${copy.coverAlt}`}
                aria-haspopup="dialog"
                onClick={() => setActivePhoto(0)}
                className="liquid-glass block w-full cursor-zoom-in overflow-hidden rounded-[1.25rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
              >
                <img
                  src={cover}
                  alt={copy.coverAlt}
                  width="1920"
                  height="1280"
                  className="h-auto w-full"
                />
              </button>
              <figcaption className="mt-3 flex justify-between gap-4 font-body text-xs text-white/50">
                <span>{copy.labels.exhibitionViews} · GALLERY AND LINKS 81</span>
              </figcaption>
            </motion.figure>
          )}
          <dl className="liquid-glass mt-10 grid gap-6 rounded-[1.25rem] p-6 font-body text-sm md:grid-cols-3 md:gap-10 md:p-8">
            <div>
              <dt className="mb-2 text-xs text-white/55">{copy.labels.dates}</dt>
              <dd className="text-base text-white/90">{copy.dates}</dd>
            </div>
            <div>
              <dt className="mb-2 text-xs text-white/55">{copy.labels.hours}</dt>
              <dd className="text-base text-white/90">{copy.hours}</dd>
              <dd className="mt-1 text-white/60">{copy.finalDayHours}</dd>
            </div>
            <div>
              <dt className="mb-2 text-xs text-white/55">{copy.labels.venue}</dt>
              <dd className="text-base text-white/90">{copy.venue}</dd>
              <dd className="mt-1 leading-relaxed text-white/60">{copy.address}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section aria-labelledby="exhibition-about" className="relative px-8 py-16 md:px-16 lg:px-20">
        <motion.div
          {...reveal}
          className="soft-boundary-statement relative mx-auto max-w-6xl py-8 [container-type:inline-size] md:py-12"
        >
          <h2
            id="exhibition-about"
            className="relative mb-8 text-center font-body text-sm text-white/70"
          >
            // {copy.labels.about}
          </h2>
          <p
            className={
              language === "ja"
                ? "relative mx-auto max-w-3xl text-center font-body text-2xl font-light leading-relaxed md:text-4xl"
                : "relative mx-auto whitespace-nowrap text-center font-heading text-[clamp(0.75rem,5cqi,3rem)] italic leading-[1.05] tracking-[-0.025em]"
            }
          >
            {copy.statement[0]}
          </p>
          <div className="relative mx-auto mt-10 max-w-3xl space-y-5 font-body text-base font-light leading-relaxed text-white/85 md:text-lg">
            {copy.statement.slice(1).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <a className={linkClass} href={softBoundarySourceUrl} target="_blank" rel="noreferrer">
              {copy.labels.galleryPage} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </section>

      <section aria-labelledby="exhibition-views" className="px-8 py-12 md:px-16 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 id="exhibition-views" className="mb-6 font-body text-sm text-white/80">
            // {copy.labels.exhibitionViews}
          </h2>
          <div className="columns-2 gap-3 md:columns-3 md:gap-4">
            {images.map((image, index) => (
              <motion.figure
                {...reveal}
                key={image.src}
                className="liquid-glass relative mb-3 break-inside-avoid overflow-hidden rounded-[1rem] md:mb-4"
              >
                <button
                  type="button"
                  aria-label={`${copy.lightbox.open}: ${copy.imageAlts[index] ?? image.alt}`}
                  aria-haspopup="dialog"
                  onClick={() => setActivePhoto(index + (cover ? 1 : 0))}
                  className="group block w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-amber-200"
                >
                  <img
                    src={image.src}
                    alt={copy.imageAlts[index] ?? image.alt}
                    loading="lazy"
                    decoding="async"
                    width={image.width}
                    height={image.height}
                    className="h-auto w-full transition-transform duration-700 motion-safe:group-hover:scale-[1.025]"
                  />
                </button>
                <figcaption className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/35 px-2 py-0.5 font-body text-[10px] tabular-nums text-white/75 backdrop-blur-md md:bottom-3 md:right-3">
                  {String(index + 1).padStart(2, "0")}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="exhibition-flyer" className="px-8 py-12 md:px-16 lg:px-20">
        <div className="relative mx-auto grid max-w-6xl gap-10 py-8 md:grid-cols-2 md:items-center md:gap-16">
          <figure className="soft-boundary-flyer relative">
            <img
              src={flyer}
              alt={copy.flyer.previewAlt}
              loading="lazy"
              decoding="async"
              width="1260"
              height="851"
              className="relative h-auto w-full rounded-[1rem]"
            />
          </figure>
          <div>
            <h2 id="exhibition-flyer" className="text-2xl font-light md:text-3xl">
              {copy.flyer.title}
            </h2>
            <p className="mt-4 max-w-md text-base font-light leading-relaxed text-white/70">
              {copy.flyer.description}
            </p>
            <p className="mt-10 max-w-md text-sm leading-relaxed text-white/60">{copy.inquiry}</p>
            <a
              href={softBoundaryInquiryUrl}
              target="_blank"
              rel="noreferrer"
              className={`${linkClass} mt-4`}
            >
              {copy.labels.inquiry} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <nav
        aria-label={copy.labels.nextWork}
        className="mx-auto mt-12 max-w-6xl px-8 md:px-16 lg:px-20"
      >
        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-10">
          <span className="font-body text-xs uppercase tracking-[0.18em] text-white/55">
            {copy.labels.nextWork}
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
          title="Soft Boundary"
          photos={photos}
          initialIndex={activePhoto}
          labels={copy.lightbox}
          onClose={closeLightbox}
        />
      )}
    </article>
  );
}
