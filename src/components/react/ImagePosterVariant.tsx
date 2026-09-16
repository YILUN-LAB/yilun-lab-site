import "lite-youtube-embed/src/lite-yt-embed.css";
import type { LightboxPhoto } from "./PhotoLightbox";
import { ProjectPhoto, ProjectPhotoGallery } from "./ProjectPhotoGallery";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fadeBlurIn } from "@lib/motion-presets";

interface ImagePosterVariantProps {
  body?: ReactNode;
  poster: LightboxPhoto;
  title: string;
  tagline?: string;
  youtube?: string;
  images?: Array<LightboxPhoto & { caption?: string }>;
}

export function ImagePosterVariant({
  body,
  poster,
  title,
  tagline,
  youtube,
  images,
}: ImagePosterVariantProps) {
  const [embedReady, setEmbedReady] = useState(false);

  useEffect(() => {
    if (!youtube) return;
    let cancelled = false;
    import("lite-youtube-embed").then(() => {
      if (!cancelled) setEmbedReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [youtube]);

  return (
    <ProjectPhotoGallery title={title} photos={[poster, ...(images ?? [])]}>
      <div className="px-8 py-12 md:px-16 lg:px-20">
        <motion.figure
          {...fadeBlurIn(0)}
          className="liquid-glass relative mx-auto aspect-[16/9] max-w-6xl overflow-hidden rounded-[1.25rem]"
        >
          <ProjectPhoto photo={poster} eager />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <figcaption className="pointer-events-none absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <h2 className="font-heading text-4xl italic leading-[0.9] tracking-[-1.5px] text-white md:text-5xl lg:text-6xl">
              {title}
            </h2>
            {tagline && (
              <p className="mt-3 max-w-xl font-body text-base font-light text-white/85 md:text-lg">
                {tagline}
              </p>
            )}
          </figcaption>
        </motion.figure>

        {body && (
          <motion.div
            {...fadeBlurIn(0.1)}
            className="mx-auto mt-16 max-w-3xl font-body text-base font-light leading-relaxed text-white/90 md:text-lg [&>p]:mb-4"
          >
            {body}
          </motion.div>
        )}

        {youtube && (
          <motion.div {...fadeBlurIn(0.15)} className="mx-auto mt-16 max-w-4xl">
            <div className="mb-3 font-body text-sm text-white/80">// Watch the piece</div>
            <div className="liquid-glass relative aspect-video overflow-hidden rounded-[1.25rem]">
              {embedReady && <lite-youtube videoid={youtube} class="h-full w-full" />}
            </div>
          </motion.div>
        )}

        {images && images.length > 0 && (
          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {images.map((img, i) => (
              <motion.figure
                key={img.src}
                {...fadeBlurIn(0.05 + Math.min(i * 0.04, 0.4))}
                className="liquid-glass relative aspect-[3/4] overflow-hidden rounded-[1rem]"
              >
                <ProjectPhoto photo={img} />
                {img.caption && (
                  <figcaption className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 font-body text-xs font-light text-white/85">
                    {img.caption}
                  </figcaption>
                )}
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </ProjectPhotoGallery>
  );
}
