import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";
import { remarkDevlogFigures } from "../src/lib/remark-devlog-figures";

const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "src/content/devlog/the-unlit-cut");
const imageUrl = "/assets/images/projects/the-unlit-cut-devlog";
const pages = path.join(root, "src/pages/projects/the-unlit-cut-devlog");
const texts = {
  en: readFileSync(path.join(contentDir, "en.md"), "utf8"),
  zh: readFileSync(path.join(contentDir, "zh.md"), "utf8"),
};

async function renderMarkdown(markdown: string, filePath = path.join(contentDir, "en.md")) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkDevlogFigures, { contentDir, imageUrl, publicDir: path.join(root, "public") })
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(new VFile({ value: markdown, path: filePath }));
  return String(file);
}

describe("devlog figures", () => {
  const sample =
    "![A paper city](../images/01-first-paper-city.jpg)\n*An early prototype frame.*\n";

  it("turns an image with an italic caption into a figure", async () => {
    const html = await renderMarkdown(sample);

    expect(html).toBe(
      `<figure><img src="${imageUrl}/01-first-paper-city.webp" alt="A paper city" width="1600" height="900" loading="lazy" decoding="async"><figcaption>An early prototype frame.</figcaption></figure>`
    );
  });

  it("leaves Markdown outside the devlog folder alone", async () => {
    const html = await renderMarkdown(sample, path.join(root, "src/content/other.md"));

    expect(html).not.toContain("<figure>");
  });

  it("fails when an image has no WebP", async () => {
    await expect(renderMarkdown("![Missing](../images/99-missing.jpg)\n")).rejects.toThrow(
      /no WebP/
    );
  });
});

describe("The Unlit Cut devlog text", () => {
  for (const [lang, text] of Object.entries(texts)) {
    it(`${lang}: has one title and at least one section`, () => {
      expect(text.match(/^# /gm)).toHaveLength(1);
      expect(text.match(/^## /gm)?.length).toBeGreaterThan(0);
    });

    it(`${lang}: lists no email address or registration details`, () => {
      expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
      expect(text).not.toMatch(/registration|报名/i);
    });

    it(`${lang}: links only images that exist, each with alt text and a caption`, () => {
      const lines = text.split("\n");
      lines.forEach((line, index) => {
        const image = /^!\[(.*)\]\(\.\.\/images\/([\w.-]+)\.\w+\)$/.exec(line);
        if (!line.startsWith("![")) return;
        expect(image, `line ${index + 1}`).not.toBeNull();
        expect(image![1].trim()).not.toBe("");
        expect(existsSync(path.join(root, "public", imageUrl, `${image![2]}.webp`))).toBe(true);
        expect(lines[index + 1]).toMatch(/^\*.+\*$/);
      });
    });
  }
});

describe("The Unlit Cut devlog pages", () => {
  it("mounts one idle image viewer in the shared bilingual layout", () => {
    const layout = readFileSync(path.join(root, "src/components/DevlogLayout.astro"), "utf8");
    expect(layout.match(/<DevlogLightbox\b/g)).toHaveLength(1);
    expect(layout).toMatch(/<DevlogLightbox\s+client:idle/);
  });

  it("does not link the English page to the Chinese one", () => {
    const english = readFileSync(path.join(pages, "index.astro"), "utf8");

    expect(english).not.toContain("languageLink");
    expect(english).not.toMatch(/devlog\/zh/);
  });

  it("links the Chinese page back to English", () => {
    const chinese = readFileSync(path.join(pages, "zh.astro"), "utf8");

    expect(chinese).toContain(
      'languageLink={{ href: "/projects/the-unlit-cut-devlog", label: "English", lang: "en" }}'
    );
  });
});
