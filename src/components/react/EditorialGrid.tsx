import { useMemo, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { gradientFor, type AccentName } from "@lib/accent-gradients";
import { easeOut } from "@lib/motion-presets";
import {
  computeAshlarLayout,
  type Breakpoint,
  type LayoutItem,
  type Placement,
  type Tier,
} from "@lib/ashlar";
import { ArrowUpRight } from "./icons";

export interface WorkCardData {
  slug: string;
  title: string;
  subtitle?: string;
  tagline: string;
  category: string[];
  year?: string;
  accent: AccentName;
  /** Editorial nudge only: raises or lowers the chance of a feature slot. */
  weight: "lead" | "feature" | "column" | "tile";
  cover?: string;
}

const BREAKPOINTS: Breakpoint[] = ["sm", "md", "lg"];

// Card chrome scales with the Ashlar tier. Tablet sits one step below desktop
// because its cards are narrower (a 12-column unit is about 43px there).
const TIER_TITLE_CLASS: Record<Tier, string> = {
  lead: "font-heading text-4xl italic leading-[0.9] tracking-[-1.5px] text-white md:text-5xl lg:text-6xl",
  feature:
    "font-heading text-3xl italic leading-[0.95] tracking-[-1px] text-white md:text-[1.75rem] lg:text-4xl",
  tile: "font-heading text-2xl italic leading-none tracking-[-1px] text-white md:text-[1.375rem] lg:text-3xl",
};

const TIER_OVERLAY_PADDING: Record<Tier, string> = {
  lead: "p-6 md:p-8 lg:p-10",
  feature: "p-5 md:p-5 lg:p-7",
  tile: "p-5 md:p-5 lg:p-6",
};

const TIER_TAGLINE_CLASS: Record<Tier, string> = {
  lead: "mt-3 max-w-xl font-body text-base font-light text-white/85 md:text-lg",
  feature: "mt-2 max-w-md font-body text-sm font-light text-white/85 lg:text-base",
  tile: "mt-2 max-w-[40ch] font-body text-sm font-light leading-snug text-white/85 md:text-xs lg:text-sm",
};

const TIER_CTA_CLASS: Record<Tier, string> = {
  lead: "liquid-glass-strong liquid-glass-tint mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-semibold transition-transform group-hover:translate-x-0.5",
  feature:
    "liquid-glass mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-body text-xs font-medium text-white transition-transform group-hover:translate-x-0.5",
  tile: "liquid-glass mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-xs font-medium text-white transition-transform group-hover:translate-x-0.5",
};

const TIER_CTA_ICON_CLASS: Record<Tier, string> = {
  lead: "h-4 w-4",
  feature: "h-3.5 w-3.5",
  tile: "h-3 w-3",
};

/** Reverses the memo key: "slug:weight|slug:weight" back into engine items. */
function parseLayoutKey(key: string): LayoutItem[] {
  if (key === "") return [];
  return key.split("|").map((entry) => {
    const [slug, weight] = entry.split(":");
    return { slug, weight: weight as LayoutItem["weight"] };
  });
}

/** Inline variables consumed by the `.ashlar-grid` rules in global.css. */
function placementStyle(placements: Record<Breakpoint, Placement>): CSSProperties {
  const style: Record<string, string> = {};
  for (const bp of BREAKPOINTS) {
    const p = placements[bp];
    style[`--ashlar-${bp}-col`] = `${p.x + 1} / span ${p.w}`;
    style[`--ashlar-${bp}-row`] = `${p.y + 1} / span ${p.h}`;
  }
  return style as CSSProperties;
}

interface CardProps {
  item: WorkCardData;
  tier: Tier;
  placements: Record<Breakpoint, Placement>;
  showFeaturedBadge: boolean;
  index: number;
}

function Card({ item, tier, placements, showFeaturedBadge, index }: CardProps) {
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
      className="group block"
      style={placementStyle(placements)}
    >
      <div className="liquid-glass relative h-full w-full overflow-hidden rounded-[1.25rem]">
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

        <div className={`absolute bottom-0 left-0 right-0 ${TIER_OVERLAY_PADDING[tier]}`}>
          <h3 className={TIER_TITLE_CLASS[tier]}>{item.title}</h3>

          {item.subtitle && tier !== "tile" && (
            <div className="mt-1 font-body text-sm font-light text-white/70">{item.subtitle}</div>
          )}

          <p className={TIER_TAGLINE_CLASS[tier]}>{item.tagline}</p>

          <span className={TIER_CTA_CLASS[tier]}>
            View case study <ArrowUpRight className={TIER_CTA_ICON_CLASS[tier]} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

interface EditorialGridProps {
  items: WorkCardData[];
  mode: "lab" | "works";
}

/**
 * Shared editorial grid for the homepage's Lab and Works sections, laid out
 * by the Ashlar engine (`@lib/ashlar`, documented in docs/ashlar.md).
 *
 * The engine decides every card's tier, size and position for all three
 * breakpoints from the item order alone, so the same list always renders the
 * same layout on the server and the client. Nothing here hard-codes spans or
 * aspect ratios; card chrome only follows the resolved tier. `mode="lab"`
 * adds the "// Featured" pill to the lead.
 */
export function EditorialGrid({ items, mode }: EditorialGridProps) {
  // The layout depends only on slug order and weights, so key the memo on
  // exactly that and rebuild the engine input from the key.
  const layoutKey = items.map((item) => `${item.slug}:${item.weight}`).join("|");
  const layout = useMemo(() => computeAshlarLayout(parseLayoutKey(layoutKey)), [layoutKey]);

  return (
    <div className="ashlar">
      <div className="ashlar-grid">
        <AnimatePresence initial={false}>
          {items.map((item, i) => {
            const placements = {
              sm: layout.sm.best.placements[i],
              md: layout.md.best.placements[i],
              lg: layout.lg.best.placements[i],
            };
            const tier = placements.lg.tier;
            return (
              <Card
                key={item.slug}
                item={item}
                tier={tier}
                placements={placements}
                showFeaturedBadge={mode === "lab" && tier === "lead"}
                index={i}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
