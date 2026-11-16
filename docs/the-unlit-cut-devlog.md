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

The source of truth is the private `YILUN-LAB/the-unlit-cut-devlog` repository.
To publish a revision, copy `en/STORY.md` unchanged to
`src/content/devlog/the-unlit-cut/en.md` and `zh/STORY.md` unchanged to
`src/content/devlog/the-unlit-cut/zh.md`. Do not edit, translate, or reformat
either text in this repository. Verify that each destination is byte-for-byte
identical to its source before publishing. Both languages contain the full text.
The `#` heading becomes the page title, and each `##` heading becomes an entry
in the table of contents.

The current import is source commit `c2ab47e1a3fcc41872b399751a08fafd631ec9af`
(final illustrated text for the submitted v1.0.4 build). Both languages contain
32 figures and no fenced code blocks. The image directory retains all 33 WebPs,
including the city-sweep comparison that is no longer referenced by the text.

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
article. There is no studio navigation or footer. Styles are the `.devlog` block
at the end of `src/styles/global.css`; the Chinese page uses the system sans-serif
throughout.

`DevlogLightbox.tsx` hydrates once with `client:idle`. It enhances the static
figures with native image buttons and reuses `PhotoLightbox.tsx` for the enlarged,
uncropped images, captions, arrow/swipe navigation and modal focus/scroll cleanup.
The images and captions remain visible with JavaScript disabled. Unmounting the
island restores the original figure markup. Viewer controls follow the article
language from `document.documentElement.lang`; English uses the shared viewer labels.
The preview and full-size sources both use each inline image's current source.
Pointer activation focuses the image button so closing returns to that image in
browsers that do not focus buttons on click. The Chinese-to-English link remains asymmetric.
