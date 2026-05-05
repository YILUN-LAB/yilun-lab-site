import { gradientFor, type AccentName } from "@lib/accent-gradients";
import type { ChapterImage } from "./Chapters";

interface ChapterProps {
  name: string;
  note?: string;
  accent?: AccentName;
  cover?: string;
  youtube?: string;
  images?: ChapterImage[];
  description: string;
  hidden?: boolean;
}

/**
 * Rendered by <Chapters>, never directly by MDX.
 * `hidden` uses display:none instead of unmounting to preserve youtube embed state.
 */
export function Chapter({
  name,
  note,
  accent,
  cover,
  youtube,
  images,
  description,
  hidden,
}: ChapterProps) {
  return (
    <section
      data-chapter-name={name}
      className="mx-auto max-w-6xl px-8 py-16 md:px-16 lg:px-20"
      style={hidden ? { display: "none" } : undefined}
    >
      <div className="mb-8">
        <div className="mb-2 font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
          // Chapter
        </div>
        <h3 className="font-heading text-4xl italic leading-[0.95] tracking-[-1.5px] text-white md:text-5xl lg:text-6xl">
          {name}
        </h3>
        {note && (
          <p className="mt-2 font-body text-base font-light italic text-white/70 md:text-lg">
            {note}
          </p>
        )}
      </div>

      <div className="liquid-glass relative mb-8 aspect-video overflow-hidden rounded-[1.25rem]">
        {youtube ? (
          <lite-youtube videoid={youtube} class="h-full w-full" />
        ) : cover ? (
          <img
            src={cover}
            alt={`${name} — cover`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: gradientFor(accent) }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(35% 35% at 50% 50%, rgba(255,255,255,0.18), transparent 70%)",
                mixBlendMode: "screen",
              }}
            />
          </>
        )}
      </div>

      <div className="prose prose-invert mx-auto max-w-3xl font-body text-base font-light leading-relaxed text-white/90 md:text-lg [&>p]:mb-4">
        <p>{description}</p>
      </div>

      {images && images.length > 0 && (
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {images.map((img) => (
            <figure
              key={img.src}
              className="liquid-glass relative aspect-[3/4] overflow-hidden rounded-[1rem]"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {img.caption && (
                <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 font-body text-xs font-light text-white/85">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
