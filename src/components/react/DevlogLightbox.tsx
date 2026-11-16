import { useCallback, useEffect, useRef, useState } from "react";
import {
  PhotoLightbox,
  photoLightboxLabels,
  type LightboxLabels,
  type LightboxPhoto,
} from "./PhotoLightbox";

const labels: Record<"en" | "zh-Hans", LightboxLabels> = {
  en: photoLightboxLabels,
  "zh-Hans": {
    title: "开发日志图片",
    open: "看图",
    close: "关闭",
    previous: "上一张",
    next: "下一张",
    loading: "加载中…",
    unavailable: "大图加载失败，显示预览图",
  },
};

/** Enhance the static Markdown figures only after hydration; inline images need no JS. */
export default function DevlogLightbox() {
  const marker = useRef<HTMLSpanElement>(null);
  const [lang, setLang] = useState<"en" | "zh-Hans">("en");
  const [photos, setPhotos] = useState<LightboxPhoto[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);

  useEffect(() => {
    const root = marker.current?.closest(".devlog");
    if (!root) return;
    setLang(document.documentElement.lang.toLowerCase().startsWith("zh") ? "zh-Hans" : "en");
    const images = Array.from(root.querySelectorAll<HTMLImageElement>("figure img")).filter(
      (image) => !image.closest("button, a")
    );
    setPhotos(
      images.map((image) => ({
        src: image.currentSrc || image.src,
        fullSrc: image.currentSrc || image.src,
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
      const open = () => {
        // Pointer activation does not focus buttons in every browser. Give the
        // shared dialog a reliable trigger to restore focus to when it closes.
        button.focus({ preventScroll: true });
        setIndex(imageIndex);
      };
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
