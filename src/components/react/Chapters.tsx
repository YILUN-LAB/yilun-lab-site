import type { ReactNode } from "react";
import { useState } from "react";
import { ChaptersContext, type ChapterMeta } from "./ChaptersContext";
import { PillTabs, type PillTab } from "./PillTabs";

interface ChaptersProps {
  variant: "chapters" | "chapters-tabbed";
  chapters: ChapterMeta[];
  children: ReactNode;
}

export function Chapters({ variant, chapters, children }: ChaptersProps) {
  const [activeName, setActiveName] = useState(chapters[0]?.name ?? "");

  const tabs: PillTab[] = chapters.map((c) => ({ id: c.name, label: c.name }));

  return (
    <ChaptersContext.Provider value={{ variant, chapters, activeName, setActiveName }}>
      {variant === "chapters-tabbed" && chapters.length > 0 && (
        <div className="px-8 md:px-16 lg:px-20 py-8 flex justify-center">
          <PillTabs tabs={tabs} activeId={activeName} onChange={setActiveName} />
        </div>
      )}
      <div>{children}</div>
    </ChaptersContext.Provider>
  );
}
