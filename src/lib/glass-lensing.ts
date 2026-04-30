import { useEffect } from "react";

/**
 * Tracks the pointer and writes its relative position into --gx/--gy on every
 * ancestor `.liquid-glass` / `.liquid-glass-strong` element under the cursor.
 * The radial gradients in global.css read those vars to bend specular highlights
 * toward the pointer.
 *
 * Call once at the top of any island that contains glass elements (Navbar
 * works because it appears on every page).
 */
export function useGlassLensing() {
  useEffect(() => {
    function onMove(e: PointerEvent) {
      let node: HTMLElement | null = e.target as HTMLElement | null;
      while (node && node !== document.documentElement) {
        const cl = node.classList;
        if (cl && (cl.contains("liquid-glass") || cl.contains("liquid-glass-strong"))) {
          const r = node.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          node.style.setProperty("--gx", x + "%");
          node.style.setProperty("--gy", y + "%");
        }
        node = node.parentElement;
      }
    }
    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
}
