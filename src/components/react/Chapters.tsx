import { useEffect, useState } from "react";
import { PillTabs, type PillTab } from "./PillTabs";
import { Chapter } from "./Chapter";
import type { AccentName } from "@lib/accent-gradients";

export interface ChapterImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface ChapterData {
  name: string;
  note: string;
  accent?: AccentName;
  cover?: string;
  youtube?: string;
  images?: ChapterImage[];
  description: string;
}

interface ChaptersProps {
  variant: "chapters" | "chapters-tabbed";
  chapters: ChapterData[];
}

export function Chapters({ variant, chapters }: ChaptersProps) {
  const [activeName, setActiveName] = useState(chapters[0]?.name ?? "");

  useEffect(() => {
    import("lite-youtube-embed");
    import("lite-youtube-embed/src/lite-yt-embed.css");
  }, []);

  const tabs: PillTab[] = chapters.map((c) => ({ id: c.name, label: c.name }));

  return (
    <div>
      {variant === "chapters-tabbed" && chapters.length > 0 && (
        <div className="flex justify-center px-8 py-8 md:px-16 lg:px-20">
          <PillTabs tabs={tabs} activeId={activeName} onChange={setActiveName} />
        </div>
      )}
      {chapters.map((c) => (
        <Chapter
          key={c.name}
          name={c.name}
          note={c.note}
          accent={c.accent}
          cover={c.cover}
          youtube={c.youtube}
          images={c.images}
          description={c.description}
          hidden={variant === "chapters-tabbed" && c.name !== activeName}
        />
      ))}
    </div>
  );
}
