/**
 * One-shot asset optimizer. Reads raw images from
 * `migration/YILUN LAB Assets/` and emits WebP outputs to
 * `public/assets/images/projects/<slug>/` and `public/assets/images/founder/`.
 *
 * Run via: `npm run assets:optimize`
 *
 * Idempotent: re-runs overwrite outputs, and remove any stale `.webp`
 * outputs in a slug folder that no longer have a source file.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const REPO_ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const ASSETS_ROOT = path.join(REPO_ROOT, "migration/YILUN LAB Assets");
const PROJECTS_OUT = path.join(REPO_ROOT, "public/assets/images/projects");
const FOUNDER_OUT = path.join(REPO_ROOT, "public/assets/images/founder");

const SLUG_BY_FOLDER: Record<string, string> = {
  "1. A Human Permeability ": "human-permeability",
  "2. TRUE SELF": "true-self",
  "3. H_ER": "her",
  "4. THROUGH LIMITS": "through-limits",
  "5. TAO CAVE": "tao-cave",
  "6. MO GU": "mo-gu",
  "7. SAOKO": "saoko",
  "8. MYSELF": "myself",
  "9. BIZCOCHITO": "bizcochito",
  "10. Mood Cocoon": "mood-cocoon",
};

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const SKIP_FILES = new Set([".DS_Store", "Tao Cave Final.mp4"]);

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function listImageSources(folder: string): Promise<string[]> {
  const entries = await fs.readdir(folder);
  return entries
    .filter((name) => !SKIP_FILES.has(name))
    .filter((name) => IMAGE_EXTS.has(path.extname(name).toLowerCase()))
    .sort((a, b) =>
      a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }),
    );
}

async function optimizeProjectFolder(folderName: string, slug: string) {
  const inputDir = path.join(ASSETS_ROOT, folderName);
  const outputDir = path.join(PROJECTS_OUT, slug);
  await ensureDir(outputDir);

  const sources = await listImageSources(inputDir);
  const expected = new Set<string>();

  for (let i = 0; i < sources.length; i++) {
    const idx = String(i + 1).padStart(2, "0");
    const outName = `${idx}.webp`;
    expected.add(outName);

    const inPath = path.join(inputDir, sources[i]);
    const outPath = path.join(outputDir, outName);

    await sharp(inPath)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);

    process.stdout.write(`  ${slug}/${outName} <- ${sources[i]}\n`);
  }

  // Remove any stale .webp outputs that no longer correspond to a source.
  const existing = await fs.readdir(outputDir);
  for (const name of existing) {
    if (name.endsWith(".webp") && !expected.has(name)) {
      await fs.rm(path.join(outputDir, name));
      process.stdout.write(`  removed stale ${slug}/${name}\n`);
    }
  }
}

async function optimizeFounder() {
  const inPath = path.join(ASSETS_ROOT, "headshot.jpg");
  await ensureDir(FOUNDER_OUT);
  const outPath = path.join(FOUNDER_OUT, "headshot.webp");
  await sharp(inPath)
    .rotate()
    .resize({ width: 1024, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outPath);
  process.stdout.write(`  founder/headshot.webp\n`);
}

async function main() {
  process.stdout.write(`Optimizing project assets...\n`);
  for (const [folderName, slug] of Object.entries(SLUG_BY_FOLDER)) {
    process.stdout.write(`-> ${slug}\n`);
    await optimizeProjectFolder(folderName, slug);
  }
  process.stdout.write(`Optimizing founder portrait...\n`);
  await optimizeFounder();
  process.stdout.write(`Done.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
