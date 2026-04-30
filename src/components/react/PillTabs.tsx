import { useEffect, useRef, useState } from "react";

export interface PillTab {
  id: string;
  label: string;
  badge?: string | number;
}

interface PillTabsProps {
  tabs: PillTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function PillTabs({ tabs, activeId, onChange, className = "" }: PillTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const active = c.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) return;
    const cR = c.getBoundingClientRect();
    const aR = active.getBoundingClientRect();
    setIndicator({ left: aR.left - cR.left, width: aR.width, opacity: 1 });
  }, [activeId, tabs]);

  return (
    <div
      ref={containerRef}
      className={
        "liquid-glass relative inline-flex flex-wrap items-center gap-1 rounded-full p-1.5 " +
        className
      }
    >
      <span
        className="liquid-glass-tint pointer-events-none absolute rounded-full"
        style={{
          left: indicator.left,
          width: indicator.width,
          top: 6,
          bottom: 6,
          opacity: indicator.opacity,
          transition:
            "left 420ms cubic-bezier(.2,.9,.2,1), width 420ms cubic-bezier(.2,.9,.2,1), opacity 240ms ease",
          zIndex: 0,
        }}
      />
      {tabs.map((t) => {
        const isActive = activeId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            data-active={isActive}
            onClick={() => onChange(t.id)}
            className={
              "relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-medium transition-colors duration-300 " +
              (isActive ? "text-[#fff5e0]" : "glass-link text-white/85")
            }
            style={isActive ? { textShadow: "0 1px 0 rgba(80,40,5,0.45)" } : undefined}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className={"text-[10px] " + (isActive ? "text-[#fff0d0]/75" : "text-white/50")}>
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
