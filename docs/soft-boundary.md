# Soft Boundary exhibition

The public case study is `/projects/soft-boundary`. Its exhibition details and
statement come from the [GALLERY AND LINKS 81 listing](https://galleryandlinks81.jp/exhibition-2026/yilun-zhansolo-exhibition/).
The owner supplied `Yilun Zhan DM.jpeg` and `Yilun Zhan DM.pdf` as flyer sources.

## Content and assets

- `src/content/projects/soft-boundary.mdx` stores project metadata, the cover,
  and the ordered list of 13 installation photographs.
- `src/lib/data/soft-boundary.ts` holds English and Japanese copy, image
  descriptions, gallery links, and the homepage announcement.
- `public/assets/images/projects/soft-boundary/` contains the optimized images.
  `installation-01.webp` through `installation-13.webp` follow the gallery order;
  `gallery-poster.webp` preserves the listing's poster; `exhibition-flyer.webp`
  is the display image from the supplied flyer. `cover.jpg` is the social image.

The page displays all 13 installation photographs and the flyer. The flyer has
no download link or public PDF. Artist biography and awards remain outside this
case study. Keep English and Japanese content and image descriptions in sync
when updating the exhibition.

## Rendering and language

`src/pages/projects/[slug].astro` selects `SoftBoundaryLayout.astro` for this slug.
That layout mounts `SoftBoundaryProject.tsx` alongside the shared navigation and
footer. Other case studies continue to use `CaseStudyLayout.astro`.

The article initially renders in English. After hydration, it uses Japanese when
`navigator.language` starts with `ja`; other device languages use English.
The English/日本語 controls change only this article. They do not write a saved
language preference or change the document's language, navigation, or other pages.

## Homepage

The announcement shows both exhibition titles on one line. Its second line shows
the dates and full venue from 640px upwards; smaller screens show the dates and
Tokyo. The Exhibition badge, text column, and arrow align with the LIT award news
below it. The LIT announcement links to its original award listing.

The three featured projects are Soft Boundary, A Human Permeability, and Mood
Cocoon, in that order. Mo Gu appears in Works. Layout rules are documented in
[Ashlar](ashlar.md).

## Verification

`tests/soft-boundary.test.tsx` covers device-language selection, both manual
switch directions, language isolation, all 13 photographs, the display-only flyer,
and next-work navigation. Run the repository checks and build after changing the
page or metadata. For visual changes, inspect the homepage and case study at
375px, 768px, and 1280px, including both project languages and the Works filters.
