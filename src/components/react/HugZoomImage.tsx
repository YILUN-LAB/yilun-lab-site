import { hug } from "@lib/data/hug";

export interface HugZoomImageSource {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface HugZoomImageProps {
  image: HugZoomImageSource;
  onOpen: (src: string) => void;
  eager?: boolean;
  className?: string;
  /** Crops the image to this aspect class, e.g. "aspect-[4/3]". The viewer still shows it uncropped. */
  aspectClass?: string;
}

/** An image that opens the page's photo viewer. Keeps its own aspect ratio unless `aspectClass` is set. */
export function HugZoomImage({
  image,
  onOpen,
  eager = false,
  className = "",
  aspectClass,
}: HugZoomImageProps) {
  const imageFit = aspectClass ? "absolute inset-0 h-full w-full object-cover" : "h-auto w-full";

  return (
    <button
      type="button"
      aria-label={`${hug.labels.enlarge}: ${image.alt}`}
      aria-haspopup="dialog"
      onClick={() => onOpen(image.src)}
      className={`group relative block w-full cursor-zoom-in overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200 ${aspectClass ?? ""} ${className}`}
    >
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`${imageFit} transition-transform duration-700 motion-safe:group-hover:scale-[1.02]`}
      />
    </button>
  );
}
