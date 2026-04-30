import { createContext, useContext } from "react";
import type { AccentName } from "@lib/accent-gradients";

export interface ChapterMeta {
  name: string;
  note: string;
  accent?: AccentName;
  cover?: string;
}

export interface ChaptersContextValue {
  variant: "chapters" | "chapters-tabbed";
  chapters: ChapterMeta[];
  activeName: string;
  setActiveName: (name: string) => void;
}

export const ChaptersContext = createContext<ChaptersContextValue | null>(null);

export function useChaptersContext(): ChaptersContextValue {
  const ctx = useContext(ChaptersContext);
  if (!ctx) {
    throw new Error("Chapter components must be used inside <Chapters>");
  }
  return ctx;
}
