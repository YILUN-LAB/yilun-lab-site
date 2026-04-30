import { createContext, useContext } from "react";

export interface ChapterMeta {
  name: string;
  note: string;
  accent?: string;
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
