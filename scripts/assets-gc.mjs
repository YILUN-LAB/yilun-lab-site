#!/usr/bin/env node
/**
 * Scans public/assets/images/projects/ for files that no MDX file references.
 * By default reports orphans without deleting; pass --delete to remove.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const PROJECTS_ROOT = path.join(REPO_ROOT, "public/assets/images/projects");
const CONTENT_ROOT = path.join(REPO_ROOT, "src/content/projects");

const args = new Set(process.argv.slice(2));
const SHOULD_DELETE = args.has("--delete");

async function readAllReferencedPaths() {
  const referenced = new Set();
  const files = await fs.readdir(CONTENT_ROOT);
  const mdxFiles = files.filter((f) => f.endsWith(".mdx"));
  const texts = await Promise.all(
    mdxFiles.map((f) => fs.readFile(path.join(CONTENT_ROOT, f), "utf8"))
  );
  for (const text of texts) {
    for (const m of text.matchAll(/\/assets\/images\/projects\/[\w-]+\/[\w.-]+/g)) {
      referenced.add(m[0]);
    }
  }
  return referenced;
}

async function listAssetFiles() {
  const out = [];
  const slugs = await fs.readdir(PROJECTS_ROOT);
  for (const slug of slugs) {
    const dir = path.join(PROJECTS_ROOT, slug);
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) continue;
    const files = await fs.readdir(dir);
    for (const f of files) {
      if (f.startsWith(".")) continue;
      out.push(`/assets/images/projects/${slug}/${f}`);
    }
  }
  return out;
}

async function main() {
  const referenced = await readAllReferencedPaths();
  const all = await listAssetFiles();
  const orphans = all.filter((p) => !referenced.has(p));

  if (orphans.length === 0) {
    console.log("No orphaned assets.");
    return;
  }

  console.log(`Found ${orphans.length} orphaned asset(s):`);
  for (const p of orphans) console.log(`  ${p}`);

  if (SHOULD_DELETE) {
    for (const p of orphans) {
      await fs.rm(path.join(REPO_ROOT, "public", p));
      console.log(`  removed ${p}`);
    }
  } else {
    console.log("\nRun with --delete to remove these files.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
