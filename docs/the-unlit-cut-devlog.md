# The Unlit Cut devlog (/projects/the-unlit-cut-devlog)

A long-form devlog for _The Unlit Cut_, the team's 2026 Epic AI MegaJam game,
published under the team name YILUN LAB. Like Hug it is unlisted: it exists only
at its direct URL, is not a project entry (so it never appears on the homepage,
in Works or in next-work links) and is excluded from the sitemap in
`astro.config.mjs`. The English page does not link to the Chinese one; the
Chinese page has one "English" link back. Keep email addresses and contest
registration details off the page; `tests/the-unlit-cut-devlog.test.ts` checks
the text for both.

## Text

Each language is one plain Markdown file with no frontmatter, written outside
the site and copied in unchanged (Prettier ignores the folder):

| Route                               | Text file                                |
| ----------------------------------- | ---------------------------------------- |
| `/projects/the-unlit-cut-devlog`    | `src/content/devlog/the-unlit-cut/en.md` |
| `/projects/the-unlit-cut-devlog/zh` | `src/content/devlog/the-unlit-cut/zh.md` |

To publish a revision, copy the new file over the old one. The `#` heading
becomes the page title, and each `##` heading becomes an entry in the table of
contents. `zh.md` is a placeholder until the Chinese text is ready.

Images are linked as `![alt](../images/NN-name.jpg)` with an italic caption on
the next line. `src/lib/remark-devlog-figures.ts` (registered in
`astro.config.mjs`) points each link at `NN-name.webp` in the image folder,
adds its size and lazy loading, and renders a `<figure>` with the caption. The
build fails if an image has no WebP.

## Images

`public/assets/images/projects/the-unlit-cut-devlog/` holds one WebP per source
JPEG (at most 1920 px wide, quality 80, as the project optimizer does) and
`cover.jpg`, a 1200 × 630 social image cut from the first image. Regenerate
them all from the source folder with:

```sh
node scripts/optimize-devlog-images.mjs <folder with NN-name.jpg files>
```

## Rendering

`src/pages/projects/the-unlit-cut-devlog/index.astro` and `zh.astro` render
`src/components/DevlogLayout.astro`: a YILUN LAB byline, the table of contents
(above the text on narrow screens, a sticky column from 1024 px) and the
article. There is no studio navigation, footer or JavaScript island. Styles
are the `.devlog` block at the end of `src/styles/global.css`; the Chinese page
uses the system sans-serif throughout.
