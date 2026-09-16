# Editorial Grid

The homepage's Lab and Works sections share
[`EditorialGrid`](../src/components/react/EditorialGrid.tsx). Both use 20px gaps,
aligned cards, and a responsive grid: one column on mobile, two on tablet, and
twelve at desktop widths. Card media stretches to fill its row.

## Card weights

The MDX `weight` controls title size, overlay padding, tagline styling, and CTA
size. Column spans adapt to each composition and item count.

| Weight    | Treatment                                        |
| --------- | ------------------------------------------------ |
| `lead`    | Largest title, generous padding, largest CTA.    |
| `feature` | Prominent supporting title and CTA.              |
| `column`  | Compact title and body text for supporting work. |
| `tile`    | Smallest type and CTA; omits the subtitle.       |

Every card includes the year, title, tagline, and a "View case study" CTA.
`mode="lab"` also displays a `// Featured` badge on the lead.

## Promotion and sparse views

The first item is always rendered as `lead`, regardless of its declared weight.
Lab orders projects by `featured`; Works orders them by `order` and promotes
the first project in the active filter.

- One item spans the full row.
- Two items promote the second to `feature` and use a 7+5 desktop split.
- Three items place a seven-column lead across two desktop rows, with two
  five-column cards stacked beside it.

Other positions retain their declared weights for typography and controls.

## Lab composition

`LabSection` passes `composition="featured"` and section-specific lead/column
weights for exactly three projects, without changing their MDX weights.

At desktop widths, the lead fills the height of two stacked supporting cards.
The split is seven columns plus five columns. Supporting media uses 16:10 with
a 272px minimum height. All edges align without top offsets.

Tablet places a 4:3 lead above two 5:4 supporting cards. Mobile stacks a 4:5
lead above two 4:3 supporting cards, leaving room for the lead's text and badges.

## Works composition

For four or more projects, the desktop grid opens with a 7+5 pair, then fills
rows with three equal cards. A final pair uses half-width cards. If the remaining
count would leave one card alone, the final four cards form two pairs instead.
This allocation follows source order.

Tablet places the full-width lead above pairs. Any final unpaired card spans
both columns. Mobile stacks all cards, using 4:5 for the lead and 4:3 for the rest.

The lead uses 4:3 from tablet upwards. Supporting media uses weight-based aspect
ratios or an explicit MDX `aspect`; desktop pairs at the end default to 5:4.
A final full-width tablet card uses 16:10. In the three-item desktop layout,
supporting cards use 16:10 with a 272px minimum height. Row stretching can make
the displayed media taller than its preferred aspect ratio.

## Project metadata

```yaml
weight: column # lead | feature | column | tile; defaults to column
aspect: 4/5 # optional desktop preference for supporting Works cards
order: 11 # ascending public order
```

The accepted values live in
[`src/content.config.ts`](../src/content.config.ts). Keep metadata tied to the
project's editorial intent; composition and promotion determine its placement
within each filtered view.
