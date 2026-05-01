#!/usr/bin/env node
/**
 * Generate the /connect QR code: SVG + 2048×2048 PNG with a centered
 * Yilun Lab mark on a white roundel halo. Re-run when the URL changes
 * or the brand mark is updated. Output is committed.
 *
 * Mirrors scripts/make-og-image.mjs in style: pure Node ESM, no build
 * step, idempotent.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const URL_TO_ENCODE = "https://yilunlab.com/connect";
const OUT_DIR = path.join(ROOT, "public", "assets", "brand", "qr");
const SVG_OUT = path.join(OUT_DIR, "connect-qr.svg");
const PNG_OUT = path.join(OUT_DIR, "connect-qr.png");
const MARK_SRC = path.join(
  ROOT,
  "public",
  "assets",
  "brand",
  "logos",
  "svg",
  "yilun-lab-mark-black.svg"
);

const PNG_SIZE = 2048;
const HALO_SIZE = 480;
const LOGO_SIZE = 440;
const MODULE_COLOR = "#0a0705"; // matches --warm-bg
const BG_COLOR = "#ffffff";

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // 1. SVG QR — vector, tracked.
  const svg = await QRCode.toString(URL_TO_ENCODE, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: { dark: MODULE_COLOR, light: BG_COLOR },
  });
  await writeFile(SVG_OUT, svg, "utf8");
  console.log(`✓ wrote ${path.relative(ROOT, SVG_OUT)}`);

  // 2. Rasterize the SVG into a 2048-square PNG to use as the QR base.
  const baseQrPng = await sharp(Buffer.from(svg))
    .resize(PNG_SIZE, PNG_SIZE, { kernel: "nearest" })
    .png()
    .toBuffer();

  // 3. Build the white halo (slightly larger than the logo).
  const haloSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${HALO_SIZE}" height="${HALO_SIZE}">
    <circle cx="${HALO_SIZE / 2}" cy="${HALO_SIZE / 2}" r="${HALO_SIZE / 2}" fill="${BG_COLOR}"/>
  </svg>`;
  const haloPng = await sharp(Buffer.from(haloSvg))
    .resize(HALO_SIZE, HALO_SIZE)
    .png()
    .toBuffer();

  // 4. Rasterize the brand mark.
  const markSvg = await readFile(MARK_SRC);
  const markPng = await sharp(markSvg)
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 5. Composite halo + mark over the QR center.
  const haloLeft = Math.floor((PNG_SIZE - HALO_SIZE) / 2);
  const haloTop = haloLeft;
  const markLeft = Math.floor((PNG_SIZE - LOGO_SIZE) / 2);
  const markTop = markLeft;

  await sharp(baseQrPng)
    .composite([
      { input: haloPng, left: haloLeft, top: haloTop },
      { input: markPng, left: markLeft, top: markTop },
    ])
    .png({ compressionLevel: 9 })
    .toFile(PNG_OUT);

  console.log(`✓ wrote ${path.relative(ROOT, PNG_OUT)}`);
  console.log(`  encodes: ${URL_TO_ENCODE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
