/**
 * Encodes The Unlit Cut devlog images as WebP, the same way the project
 * optimizer does (at most 1920 px wide, quality 80), and writes a
 * 1200 x 630 JPEG social image from the first one.
 *
 * Usage: node scripts/optimize-devlog-images.mjs <folder of JPEG/PNG sources>
 *
 * Each source keeps its name with a .webp extension, so the Markdown link
 * `../images/01-first-paper-city.jpg` finds `01-first-paper-city.webp`.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = "public/assets/images/projects/the-unlit-cut-devlog";
const SOURCE_EXTS = new Set([".jpg", ".jpeg", ".png"]);

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error("Usage: node scripts/optimize-devlog-images.mjs <source folder>");
  process.exit(1);
}

const names = (await fs.readdir(sourceDir))
  .filter((name) => SOURCE_EXTS.has(path.extname(name).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
if (names.length === 0) throw new Error(`No JPEG or PNG images in ${sourceDir}`);

await fs.mkdir(OUT_DIR, { recursive: true });

for (const name of names) {
  const out = path.join(OUT_DIR, `${path.parse(name).name}.webp`);
  await sharp(path.join(sourceDir, name))
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out);
  console.log(`wrote ${out}`);
}

const cover = path.join(OUT_DIR, "cover.jpg");
await sharp(path.join(sourceDir, names[0]))
  .resize(1200, 630, { fit: "cover" })
  .jpeg({ quality: 85 })
  .toFile(cover);
console.log(`wrote ${cover}`);
