import { useEffect, useState } from "react";

interface UseActiveSectionOptions {
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Tracks which page-section id is currently in view via IntersectionObserver.
 * When multiple listed sections intersect simultaneously, returns the
 * topmost-in-document-order one. Returns null when none intersects, when the
 * id list is empty, or when running outside a browser (SSR-safe).
 */
export function useActiveSection(
  ids: string[],
  options: UseActiveSectionOptions = {}
): string | null {
  const { rootMargin = "-40% 0% -50% 0%", enabled = true } = options;
  const [activeId, setActiveId] = useState<string | null>(null);
  const idKey = ids.join("|");

  useEffect(() => {
    if (!enabled || ids.length === 0 || typeof IntersectionObserver === "undefined") {
      setActiveId(null);
      return;
    }

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      setActiveId(null);
      return;
    }

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const firstVisible = ids.find((id) => visible.has(id)) ?? null;
        setActiveId(firstVisible);
      },
      { rootMargin, threshold: 0 }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [idKey, rootMargin, enabled]);

  return activeId;
}
