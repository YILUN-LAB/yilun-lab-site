import { useCallback, useEffect, useRef, useState } from "react";
import { PhotoLightbox, type LightboxLabels, type LightboxPhoto } from "./PhotoLightbox";

const labels: Record<"en" | "zh-Hans", LightboxLabels> = {
  en: {
    title: "Development log images",
    open: "Enlarge image",
    close: "Close image viewer",
    previous: "Previous image",
    next: "Next image",
    loading: "Loading image…",
    unavailable: "Full-size image unavailable. Showing preview.",
  },
  "zh-Hans": {
    title: "开发日志图片",
    open: "放大图片",
    close: "关闭图片查看器",
    previous: "上一张图片",
    next: "下一张图片",
    loading: "正在加载图片…",
    unavailable: "无法加载原图，暂时显示预览图。",
  },
};

/** Enhance the static Markdown figures only after hydration; inline images need no JS. */
export default function DevlogLightbox({ lang }: { lang: "en" | "zh-Hans" }) {
  const marker = useRef<HTMLSpanElement>(null);
  const [photos, setPhotos] = useState<LightboxPhoto[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);

  useEffect(() => {
    const root = marker.current?.closest(".devlog");
    if (!root) return;
    const images = Array.from(root.querySelectorAll<HTMLImageElement>("figure img")).filter(
      (image) => !image.closest("button, a")
    );
    setPhotos(
      images.map((image) => ({
        src: image.currentSrc || image.src,
        alt: image.alt,
        caption: image.closest("figure")?.querySelector("figcaption")?.textContent?.trim(),
      }))
    );
    const restore = images.map((image, imageIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", image.alt);
      button.setAttribute("aria-haspopup", "dialog");
      button.className =
        "block w-full cursor-zoom-in rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200";
      const open = () => setIndex(imageIndex);
      button.addEventListener("click", open);
      image.replaceWith(button);
      button.append(image);
      return () => {
        button.removeEventListener("click", open);
        button.replaceWith(image);
      };
    });
    return () => restore.forEach((restoreImage) => restoreImage());
  }, []);

  return (
    <>
      <span ref={marker} hidden />
      {index !== null && photos[index] && (
        <PhotoLightbox
          title="The Unlit Cut"
          photos={photos}
          initialIndex={index}
          labels={labels[lang]}
          onClose={close}
        />
      )}
    </>
  );
}
