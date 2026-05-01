import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface MorphPillItem {
  id: string;
  label: string;
  badge?: string | number;
}

interface MorphPillProps {
  items: MorphPillItem[];
  activeId: string | null;
  onChange?: (id: string) => void;
  className?: string;
  ariaLabel?: string;
  /**
   * When true, render without the outer liquid-glass container so the
   * component can embed inside another glass surface (e.g. Navbar).
   * The amber sliding indicator is sized to the active button so it
   * works regardless of container padding.
   */
  bare?: boolean;
}

export function MorphPill({
  items,
  activeId,
  onChange,
  className = "",
  ariaLabel,
  bare = false,
}: MorphPillProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [indicator, setIndicator] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  useEffect(() => {
    if (activeId === null) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const active = containerRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]'
    );
    if (!active) return;
    const next = {
      left: active.offsetLeft,
      top: active.offsetTop,
      width: active.offsetWidth,
      height: active.offsetHeight,
      opacity: 1 as number,
    };
    setIndicator((prev) => {
      if (
        prev.left === next.left &&
        prev.top === next.top &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.opacity === next.opacity
      )
        return prev;
      return next;
    });
  }, [activeId, items.length]);

  const containerClass = bare
    ? "no-scrollbar relative inline-flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto"
    : "liquid-glass no-scrollbar relative inline-flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full p-1.5";

  const spring = { type: "spring" as const, stiffness: 520, damping: 40, mass: 1 };
  const indicatorTransition = reducedMotion
    ? { duration: 0 }
    : {
        x: spring,
        y: spring,
        width: spring,
        height: spring,
        opacity: { duration: 0.24, ease: "easeOut" as const },
      };

  return (
    <div
      ref={containerRef}
      role={ariaLabel ? "group" : undefined}
      aria-label={ariaLabel}
      className={[containerClass, className].filter(Boolean).join(" ")}
    >
      <motion.span
        className="liquid-glass-tint pointer-events-none absolute rounded-full will-change-transform"
        initial={false}
        animate={{
          x: indicator.left,
          y: indicator.top,
          width: indicator.width,
          height: indicator.height,
          opacity: indicator.opacity,
        }}
        transition={indicatorTransition}
        style={{ left: 0, top: 0, zIndex: 0 }}
      />
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            data-active={isActive}
            onClick={(e) => {
              onChange?.(item.id);
              e.currentTarget.scrollIntoView({
                block: "nearest",
                inline: "nearest",
                behavior: reducedMotion ? "auto" : "smooth",
              });
            }}
            aria-current={isActive ? "true" : undefined}
            className={
              "relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-medium transition-colors duration-300 " +
              (isActive ? "text-[#fff5e0]" : "glass-link text-white/85")
            }
            style={isActive ? { textShadow: "0 1px 0 rgba(80,40,5,0.45)" } : undefined}
          >
            {item.label}
            {item.badge !== undefined && (
              <span
                className={"text-[10px] " + (isActive ? "text-[#fff0d0]/75" : "text-white/50")}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
