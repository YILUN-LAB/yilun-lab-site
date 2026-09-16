import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { PhotoLightbox, photoLightboxLabels, type LightboxPhoto } from "./PhotoLightbox";

const OpenPhotoContext = createContext<((src: string) => void) | null>(null);

/** One viewer per project island; tabbed projects supply only their active chapter. */
export function ProjectPhotoGallery({
  title,
  photos,
  children,
}: {
  title: string;
  photos: LightboxPhoto[];
  children: ReactNode;
}) {
  const [activeSrc, setActiveSrc] = useState<string | null>(null);
  const close = useCallback(() => setActiveSrc(null), []);
  const uniquePhotos = photos.filter(
    (photo, index) => photos.findIndex((item) => item.src === photo.src) === index
  );
  const index = uniquePhotos.findIndex((photo) => photo.src === activeSrc);

  return (
    <OpenPhotoContext.Provider value={setActiveSrc}>
      {children}
      {index >= 0 && (
        <PhotoLightbox title={title} photos={uniquePhotos} initialIndex={index} onClose={close} />
      )}
    </OpenPhotoContext.Provider>
  );
}

/** Fills the existing photo frame without changing the project's layout or crop. */
export function ProjectPhoto({ photo, eager = false }: { photo: LightboxPhoto; eager?: boolean }) {
  const open = useContext(OpenPhotoContext);
  const image = (
    <img
      src={photo.src}
      alt={photo.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );

  if (!open) return image;
  return (
    <button
      type="button"
      aria-label={`${photoLightboxLabels.open}: ${photo.alt}`}
      aria-haspopup="dialog"
      onClick={() => open(photo.src)}
      className="absolute inset-0 block h-full w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-amber-200"
    >
      {image}
    </button>
  );
}
