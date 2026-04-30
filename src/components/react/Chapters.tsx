import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { PillTabs, type PillTab } from "./PillTabs";

export interface ChapterMeta {
  name: string;
  note?: string;
  accent?: string;
  cover?: string;
}

interface ChaptersProps {
  variant: "chapters" | "chapters-tabbed";
  chapters: ChapterMeta[];
  children: ReactNode;
}

export function Chapters({ variant, chapters, children }: ChaptersProps) {
  const [activeName, setActiveName] = useState(chapters[0]?.name ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  // For chapters-tabbed: imperatively toggle display on the rendered <section data-chapter-name=...>
  // elements within the children slot. The MDX-rendered Chapter components are in static HTML,
  // not in the React tree, so we can't reorder them via re-render — only via DOM manipulation.
  useEffect(() => {
    if (variant !== "chapters-tabbed") return;
    if (!containerRef.current) return;
    const sections = containerRef.current.querySelectorAll<HTMLElement>("[data-chapter-name]");
    sections.forEach((s) => {
      s.style.display = s.dataset.chapterName === activeName ? "" : "none";
    });
  }, [activeName, variant]);

  const tabs: PillTab[] = chapters.map((c) => ({ id: c.name, label: c.name }));

  return (
    <div ref={containerRef}>
      {variant === "chapters-tabbed" && chapters.length > 0 && (
        <div className="px-8 md:px-16 lg:px-20 py-8 flex justify-center">
          <PillTabs tabs={tabs} activeId={activeName} onChange={setActiveName} />
        </div>
      )}
      {children}
    </div>
  );
}
