# Editorial Grid

The homepage's Lab and Works sections share a single layout primitive:
[`<EditorialGrid>`](../src/components/react/EditorialGrid.tsx). It renders cards
on a responsive 12-column grid driven by a 4-tier *weight palette* declared
per project in MDX frontmatter.

## The four weights

| Weight    | Col-span (lg+) | Default aspect | Role                                                            |
| --------- | -------------- | -------------- | --------------------------------------------------------------- |
| `lead`    | 7              | `4/5` portrait | Section hero — biggest type, biggest CTA pill.                  |
| `feature` | 5              | `16/10` cinema | Strong supporting — pairs next to a `lead`.                     |
| `column`  | 4              | `4/5` portrait | The workhorse weight in dense Works grids.                      |
| `tile`    | 4              | `1/1` square   | Smallest, most textural — tightest type/CTA scale.              |

Every weight uses the same chrome inside the image overlay (year pill, title,
optional subtitle, tagline, "View case study" CTA). Visual hierarchy comes
from card *size* (col-span × aspect) and *text scale* — never by hiding
content. So a `tile` and a `lead` show the same elements; the tile's are
just smaller.

At smaller breakpoints the grid simplifies: 2-col at tablet (lead spans both
columns full-width); 1-col stack at mobile with all aspects flattened to
`4/3` for scrollability.

## Adding a new project

When you add a new MDX file under `src/content/projects/`, set:

```yaml
weight: column # or lead | feature | tile, per editorial intent
aspect: 4/5 # optional override; defaults to the weight's default
order: 11 # ascending — lower numbers render earlier
```

The `aspect` field is optional. The `weight` field is required (defaults to
`column` if you forget). The full enum lives in
[`src/content.config.ts`](../src/content.config.ts).

## Hero promotion (the contract that surprises)

The **first item in any list** is always rendered as `lead`, regardless of
its declared `weight`. So:

- **Lab section** sorts by `featured` (1, 2, 3) → `featured: 1` is always lead.
- **Works section** sorts by `order` ascending → first project per filter is
  the lead. Switch the filter to "Light & Dance" and the first dance project
  becomes the lead.

Putting `weight: tile` on the project that lands first will still render it
as `lead`. The `weight` you declare is the editorial intent for any
*non-first* slot — when filters or `featured` ordering change which project
sits first, the system re-promotes automatically.

## Low-count adaptive promotion

For very sparse views, span values adapt so the row reads cleanly:

- 1 item: lead spans the full row at every breakpoint.
- 2 items: lead (7-col) + feature (5-col), even if position 1 declared
  `column` or `tile` (otherwise a 7+4 row leaves a stranded gap).
- 3+ items: declared weights are honored. Use this to differentiate
  emphasis — e.g., the Lab section's `lead + feature + tile` ranking.

## Vertical staggering

Every 3rd `column` or `tile` card (in render order, at `lg+` only) gets an
`mt-12` top offset for the magazine-style ragged top edge. `lead` and
`feature` cards never offset — they're the structural anchors of each
section.

## Adding a new mode

`mode: "lab" | "works"` controls *card chrome only*, not layout. Today only
the Lab section's lead card renders the `// Featured` pill. If you need a
third mode (e.g., a future "case-studies" page), prefer adding a chrome
config object prop over expanding the `mode` string union.
