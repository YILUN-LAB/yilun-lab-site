import { motion, AnimatePresence } from "motion/react";
import { gradientFor, type AccentName } from "@lib/accent-gradients";
import { easeOut } from "@lib/motion-presets";
import { ArrowUpRight } from "./icons";

export interface WorkCardData {
  slug: string;
  title: string;
  subtitle?: string;
  tagline: string;
  category: string[];
  year?: string;
  accent: AccentName;
  weight: "lead" | "feature" | "column" | "tile";
  aspect?: "4/5" | "16/10" | "1/1" | "5/4" | "4/3" | "21/9";
  cover?: string;
}

type Weight = "lead" | "feature" | "column" | "tile";
type AspectRatio = "4/5" | "16/10" | "1/1" | "5/4" | "4/3" | "21/9";

const WEIGHT_COLSPAN: Record<Weight, string> = {
  lead: "md:col-span-2 lg:col-span-7",
  feature: "md:col-span-1 lg:col-span-5",
  column: "md:col-span-1 lg:col-span-4",
  tile: "md:col-span-1 lg:col-span-4",
};

const WEIGHT_ASPECT_DEFAULT_LG: Record<Weight, string> = {
  lead: "lg:aspect-[4/5]",
  feature: "lg:aspect-[16/10]",
  column: "lg:aspect-[4/5]",
  tile: "lg:aspect-[1/1]",
};

const WEIGHT_ASPECT_MD: Record<Weight, string> = {
  lead: "md:aspect-[4/3]",
  feature: "md:aspect-[4/5]",
  column: "md:aspect-[4/5]",
  tile: "md:aspect-[1/1]",
};

const ASPECT_LG_OVERRIDE: Record<AspectRatio, string> = {
  "4/5": "lg:aspect-[4/5]",
  "16/10": "lg:aspect-[16/10]",
  "1/1": "lg:aspect-[1/1]",
  "5/4": "lg:aspect-[5/4]",
  "4/3": "lg:aspect-[4/3]",
  "21/9": "lg:aspect-[21/9]",
};

const ASPECT_BASE = "aspect-[4/3]";

const WEIGHT_TITLE_CLASS: Record<Weight, string> = {
  lead: "font-heading text-4xl italic leading-[0.9] tracking-[-1.5px] text-white md:text-5xl lg:text-6xl",
  feature:
    "font-heading text-3xl italic leading-[0.95] tracking-[-1px] text-white md:text-4xl",
  column:
    "font-heading text-2xl italic leading-none tracking-[-1px] text-white md:text-3xl",
  tile: "font-heading text-xl italic leading-none tracking-[-0.5px] text-white md:text-2xl",
};

const WEIGHT_OVERLAY_PADDING: Record<Weight, string> = {
  lead: "p-6 md:p-10",
  feature: "p-5 md:p-7",
  column: "p-5 md:p-6",
  tile: "p-5 md:p-6",
};

function resolveWeight(declared: Weight, position: number, totalItems: number): Weight {
  // Position 0 is always promoted to lead, regardless of declared weight.
  if (position === 0) return "lead";

  // 2-item adaptive promotion: lead (7-col) + a column/tile (4-col) leaves a
  // stranded col gap. Promote position 1 to feature (5-col) so the row reads
  // cleanly. From 3 items onward, the curator's declared weight wins — the
  // hierarchy we want (lead > feature > column > tile) requires honoring it.
  if (totalItems === 2 && position === 1) return "feature";

  // Otherwise honor the declared weight from MDX.
  return declared;
}

function aspectClasses(weight: Weight, aspectOverride: AspectRatio | undefined): string {
  const md = WEIGHT_ASPECT_MD[weight];
  const lg = aspectOverride
    ? ASPECT_LG_OVERRIDE[aspectOverride]
    : WEIGHT_ASPECT_DEFAULT_LG[weight];
  return `${ASPECT_BASE} ${md} ${lg}`;
}

function leadColSpanForCount(totalItems: number): string {
  // When only 1 item, the "lead" spans the full row at every breakpoint.
  if (totalItems === 1) return "md:col-span-2 lg:col-span-12";
  return WEIGHT_COLSPAN.lead;
}

interface CardProps {
  item: WorkCardData;
  weight: Weight;
  showFeaturedBadge: boolean;
  stagger: boolean;
  index: number;
  totalItems: number;
}

function Card({ item, weight, showFeaturedBadge, stagger, index, totalItems }: CardProps) {
  const colSpan = weight === "lead" ? leadColSpanForCount(totalItems) : WEIGHT_COLSPAN[weight];
  const aspect = aspectClasses(weight, item.aspect);
  const staggerClass = stagger ? "lg:mt-12" : "";

  const titleClass = WEIGHT_TITLE_CLASS[weight];

  // For lead/feature: title + tagline + CTA inside the image overlay.
  // For column/tile: title only inside the image; tagline + category below the image.
  const showOverlay = weight === "lead" || weight === "feature";
  const showBelowTagline = weight === "column" || (weight === "tile" && !!item.tagline);

  return (
    <motion.a
      layout
      href={`/projects/${item.slug}`}
      initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      exit={{ filter: "blur(10px)", opacity: 0, y: -20 }}
      transition={{
        duration: 0.7,
        ease: easeOut,
        delay: Math.min(index * 0.06, 0.6),
      }}
      className={`group block ${colSpan} ${staggerClass}`}
    >
      <div className={`liquid-glass relative w-full overflow-hidden rounded-[1.25rem] ${aspect}`}>
        {item.cover ? (
          <img
            src={item.cover}
            alt={`${item.title} — cover`}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: gradientFor(item.accent) }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(35% 30% at 50% 45%, rgba(255,255,255,0.18), transparent 70%)",
                mixBlendMode: "screen",
              }}
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        <div className="liquid-glass absolute left-4 top-4 rounded-full px-3 py-1 font-body text-[10px] uppercase tracking-wider text-white/85">
          {item.year || "—"}
        </div>

        {showFeaturedBadge && (
          <div className="liquid-glass absolute right-4 top-4 rounded-full px-3 py-1 font-body text-[10px] uppercase tracking-wider text-white/85">
            // Featured
          </div>
        )}

        <div className={`absolute bottom-0 left-0 right-0 ${WEIGHT_OVERLAY_PADDING[weight]}`}>
          <h3 className={titleClass}>{item.title}</h3>

          {item.subtitle && weight !== "tile" && (
            <div className="mt-1 font-body text-sm font-light text-white/70">{item.subtitle}</div>
          )}

          {showOverlay && (
            <p
              className={
                weight === "lead"
                  ? "mt-3 max-w-xl font-body text-base font-light text-white/85 md:text-lg"
                  : "mt-2 max-w-md font-body text-sm font-light text-white/85 md:text-base"
              }
            >
              {item.tagline}
            </p>
          )}

          {showOverlay && (
            <span
              className={
                weight === "lead"
                  ? "liquid-glass-strong liquid-glass-tint mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-semibold transition-transform group-hover:translate-x-0.5"
                  : "liquid-glass mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-body text-xs font-medium text-white transition-transform group-hover:translate-x-0.5"
              }
            >
              View case study{" "}
              <ArrowUpRight className={weight === "lead" ? "h-4 w-4" : "h-3.5 w-3.5"} />
            </span>
          )}
        </div>
      </div>

      {showBelowTagline && (
        <div className="mt-4 flex items-start justify-between gap-3">
          <p className="max-w-[42ch] font-body text-sm font-light leading-snug text-white/85">
            {item.tagline}
          </p>
          <div className="whitespace-nowrap pt-0.5 font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
            {item.category.map((c) => `Light & ${c[0].toUpperCase() + c.slice(1)}`).join(" · ")}
          </div>
        </div>
      )}
    </motion.a>
  );
}

interface EditorialGridProps {
  items: WorkCardData[];
  mode: "lab" | "works";
}

/**
 * Shared editorial grid for the homepage's Lab + Works sections.
 *
 * Two contracts that aren't obvious from the props:
 *
 * 1. **Hero promotion.** The first item in `items` is always rendered as
 *    `lead` regardless of its declared `weight`. Items 2+ render at their
 *    declared weights as-is. So MDX `weight` is editorial intent for any
 *    non-first slot — putting the editorial weight `tile` on the project
 *    sorted first by `order` will still render it as `lead`. See
 *    `resolveWeight()`.
 *
 * 2. **Low-count adaptive promotion.** With 1 item, the lead spans the full
 *    row at every breakpoint. With 2 items, position 1 is auto-promoted to
 *    `feature` so the row tiles cleanly (7+5=12 cols). From 3 items onward,
 *    declared weights are honored — the curator's intended hierarchy
 *    (lead > feature > column > tile) wins.
 *
 * `mode="lab"` enables the "// Featured" pill on the lead card; `mode="works"`
 * keeps the lead chrome (size, CTA) but suppresses the pill.
 */
export function EditorialGrid({ items, mode }: EditorialGridProps) {
  // Walk items once, computing the resolved weight + staggering per position.
  // Counter for column/tile cards → every 3rd one gets a top offset at lg+.
  let columnTileCount = 0;

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:grid-flow-row-dense lg:items-start">
      <AnimatePresence initial={false}>
        {items.map((item, i) => {
          const resolvedWeight = resolveWeight(item.weight, i, items.length);
          let stagger = false;
          if (resolvedWeight === "column" || resolvedWeight === "tile") {
            columnTileCount++;
            if (columnTileCount % 3 === 0) stagger = true;
          }
          // Lab mode shows the "// Featured" pill on the lead card.
          // Works mode promotes the lead chrome (size, CTA) but never the badge.
          const showFeaturedBadge = mode === "lab" && resolvedWeight === "lead";

          return (
            <Card
              key={item.slug}
              item={item}
              weight={resolvedWeight}
              showFeaturedBadge={showFeaturedBadge}
              stagger={stagger}
              index={i}
              totalItems={items.length}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
