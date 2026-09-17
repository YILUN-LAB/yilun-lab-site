# Soft Boundary exhibition

The public case study is `/projects/soft-boundary`. Its exhibition details and
statement come from the [GALLERY AND LINKS 81 listing](https://galleryandlinks81.jp/exhibition-2026/yilun-zhansolo-exhibition/).
The owner supplied `Yilun Zhan DM.jpeg` and `Yilun Zhan DM.pdf` as flyer sources.

## Content and assets

- `src/content/projects/soft-boundary.mdx` stores project metadata, the cover,
  and the ordered list of six preview photographs with intrinsic dimensions.
- `src/lib/data/soft-boundary.ts` holds English and Japanese copy, image
  descriptions, gallery links, and the homepage announcement.
- `public/assets/images/projects/soft-boundary/` contains the optimized images.
  `preview-01.webp` through `preview-06.webp` follow the preview order;
  `cover.webp` comes from the explicitly named `封面.JPG`;
  `gallery-poster.webp` preserves the listing's poster; `exhibition-flyer.webp`
  is the display image from the supplied flyer. `cover.jpg` is the social image.

The page displays the designated cover, six preview photographs, and the flyer.
The six-image gallery uses CSS columns to preserve mixed portrait and landscape
compositions without cropping or empty card areas. Each photo wrapper is a full-width
inline-block so Safari treats it as an indivisible column item; reveal transforms
and glass filters belong to the inner figure, never the fragmented column box.
This prevents photos painting across columns or over the following flyer on iPad.
The flyer has
no download link or public PDF. Artist biography and awards remain outside this
case study. Keep English and Japanese content and image descriptions in sync
when updating the exhibition.

## Preview photo selection (17 September 2026)

The owner supplied this [Drive folder](https://drive.google.com/drive/folders/1QVTnZ28_RUSU5MhEz_La7ATQ9zzoR10m).
Use the named cover and six close or obscured views for an exhibition announcement;
avoid restoring the previous comprehensive installation gallery.

| Website asset              | Drive original | Selection                                     |
| -------------------------- | -------------- | --------------------------------------------- |
| `cover.webp` / `cover.jpg` | `封面.JPG`     | Owner-designated cover                        |
| `preview-01.webp`          | `DSC_2431.JPG` | Light crossing a veil and circular mirror     |
| `preview-02.webp`          | `DSC_2501.JPG` | Violet light behind dark mesh, shallow focus  |
| `preview-03.webp`          | `DSC02136.JPG` | Abstract turquoise light and cloudlike fibers |
| `preview-04.webp`          | `DSC_2571.JPG` | Golden form obscured by a woven veil          |
| `preview-05.webp`          | `DSC_2430.JPG` | Iridescent material and reflected color       |
| `preview-06.webp`          | `DSC_2566.JPG` | Reflected light trails and a blurred edge     |

WebPs are auto-oriented, resized to 1920px wide without enlargement, and encoded
at quality 80, preserving the original framing and color. The social JPEG is a
1200 × 630 centered crop of the designated cover at quality 80. Original downloads
and selection contact sheets stay in ignored `.playwright-mcp/soft-boundary-selection/`.
The seven selected original JPEGs are also served from `originals/`, preserving
the source files. `coverFullSrc` and each photograph's `fullSrc` point to these
full-resolution assets; they are fetched only when opened in the lightbox.
The old `installation-*.webp` assets were removed; the flyer and listing poster remain.

## Rendering and language

`src/pages/projects/[slug].astro` selects `SoftBoundaryLayout.astro` for this slug.
That layout mounts `SoftBoundaryProject.tsx` alongside the shared navigation and
footer. Other case studies use `CaseStudyLayout.astro` and share the same
`PhotoLightbox` through `ProjectPhotoGallery`, with their own project title.

The article initially renders in English. After hydration, it uses Japanese when
`navigator.language` starts with `ja`; other device languages use English.
The English/日本語 controls change only this article. They do not write a saved
language preference or change the document's language, navigation, or other pages.

The opening English question uses container-relative type sizing to stay on one
line from mobile through desktop without horizontal overflow.

## Photo viewer

`PhotoLightbox.tsx` uses a native modal `<dialog>` for the cover and six photographs,
in that order. Clicking a photograph opens its selected position; previous/next
buttons, Left/Right keys, and horizontal one-finger swipes wrap through all seven.
The flyer remains a display-only image outside this sequence.

The viewer shows the WebP immediately while the current original JPEG loads,
and keeps that preview if the original fails. It contains keyboard focus, locks
background scrolling, closes with Escape, its close button or the surrounding
backdrop, and restores focus to the opening photograph. Labels follow the article's
English/Japanese language. The viewer shows the image counter without a visible
photo description; image alt text remains available to assistive technology.
Image transitions honor reduced motion.

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
switch directions, language isolation, the cover and six photographs, the display-only flyer,
next-work navigation, and lightbox selection, wrapping, swipe direction, loading
fallbacks, scroll cleanup and focus restoration. Run the repository checks and build after changing the
page or metadata. For visual changes, inspect the homepage and case study at
375px, 768px, and 1280px, including both project languages and the Works filters.
