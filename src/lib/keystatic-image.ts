import imageCompression from "browser-image-compression";

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 0.8;
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_QUALITY = 0.8;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export class FileTooLargeError extends Error {
  constructor(public bytes: number) {
    super(`File too large: ${bytes} bytes (max ${MAX_FILE_SIZE_BYTES})`);
  }
}

export class InvalidFileTypeError extends Error {
  constructor(public mime: string) {
    super(`Invalid file type: ${mime}`);
  }
}

export type ImageKind = "gallery" | "cover";

/**
 * Convert an uploaded image into the project's WebP format. For `cover`
 * fields, also generate a 1200×630 JPG for the og:image meta. Mirrors
 * scripts/optimize-images.ts but runs in the browser.
 */
export async function transformProjectImage(
  file: File,
  kind: ImageKind
): Promise<Blob | [Blob, Blob]> {
  if (file.size > MAX_FILE_SIZE_BYTES) throw new FileTooLargeError(file.size);
  if (!ALLOWED_MIME.includes(file.type)) throw new InvalidFileTypeError(file.type);

  const webpPromise = imageCompression(file, {
    maxWidthOrHeight: MAX_WIDTH,
    fileType: "image/webp",
    initialQuality: WEBP_QUALITY,
    useWebWorker: true,
  });

  if (kind === "gallery") return webpPromise;

  const [webp, og] = await Promise.all([webpPromise, renderOgJpeg(file)]);
  return [webp, og];
}

async function renderOgJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = OG_WIDTH;
  canvas.height = OG_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const srcRatio = bitmap.width / bitmap.height;
  const dstRatio = OG_WIDTH / OG_HEIGHT;
  let sx = 0,
    sy = 0,
    sw = bitmap.width,
    sh = bitmap.height;
  if (srcRatio > dstRatio) {
    sw = Math.round(bitmap.height * dstRatio);
    sx = Math.round((bitmap.width - sw) / 2);
  } else {
    sh = Math.round(bitmap.width / dstRatio);
    sy = Math.round((bitmap.height - sh) / 2);
  }
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, OG_WIDTH, OG_HEIGHT);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      OG_QUALITY
    );
  });
}
