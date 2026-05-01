import { useGlassLensing } from "@lib/glass-lensing";
import { useActiveSection } from "@lib/use-active-section";
import { MorphPill } from "./MorphPill";
import { ArrowUpRight } from "./icons";

interface NavbarProps {
  /**
   * "page" mode (default): items navigate to /, /#anchor, /about, /contact.
   * "scroll" mode: items scroll to anchors on the same page (homepage only).
   */
  mode?: "page" | "scroll";
  /** When mode="page", which top-level page is active so we can highlight it. */
  activePage?: "home" | "about" | "contact" | null;
}

const NAV_ITEMS = [
  { id: "lab", label: "Lab" },
  { id: "works", label: "Works" },
  { id: "about", label: "About" },
];

const NAV_SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export function Navbar({ mode = "page", activePage = null }: NavbarProps) {
  useGlassLensing();

  const homepageActive = useActiveSection(
    mode === "scroll" ? NAV_SECTION_IDS : []
  );

  const navActiveId =
    mode === "scroll"
      ? homepageActive
      : activePage === "about"
        ? "about"
        : null;

  function jumpTo(target: string) {
    if (mode === "scroll") {
      if (target === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = document.getElementById(target);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 20;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      if (target === "top") window.location.href = "/";
      else if (target === "about") window.location.href = "/about";
      else if (target === "collaborate") window.location.href = "/contact";
      else window.location.href = `/#${target}`;
    }
  }

  return (
    <>
      <div className="scroll-edge" aria-hidden="true" />

      <nav
        aria-label="Site navigation"
        className="fixed left-0 right-0 top-4 z-50 hidden items-center justify-center px-8 font-body md:flex lg:px-16"
      >
        <div className="liquid-glass flex items-center gap-3 rounded-full p-1.5">
          <button
            onClick={() => jumpTo("top")}
            className="glass-link flex h-12 w-12 items-center justify-center rounded-full"
            aria-label="Yilun Lab home"
          >
            <img
              src="/assets/brand/logos/svg/yilun-lab-mark-white.svg"
              alt=""
              className="h-12 w-12"
            />
          </button>

          <MorphPill
            bare
            items={NAV_ITEMS}
            activeId={navActiveId}
            onChange={jumpTo}
          />

          <button
            onClick={() => jumpTo("collaborate")}
            className="liquid-glass-strong liquid-glass-tint inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold"
          >
            Collaborate <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <nav aria-label="Site navigation" className="md:hidden">
        <div className="fixed left-4 top-4 z-50">
          <button
            onClick={() => jumpTo("top")}
            className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full"
            aria-label="Yilun Lab home"
          >
            <img
              src="/assets/brand/logos/svg/yilun-lab-mark-white.svg"
              alt=""
              className="h-12 w-12"
            />
          </button>
        </div>

        <div
          className="fixed inset-x-4 bottom-0 z-50 flex justify-center"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
        >
          <div className="liquid-glass flex max-w-full items-center gap-2 rounded-full p-1.5">
            <MorphPill
              bare
              items={NAV_ITEMS}
              activeId={navActiveId}
              onChange={jumpTo}
              className="min-w-0 flex-1"
            />
            <button
              onClick={() => jumpTo("collaborate")}
              className="liquid-glass-strong liquid-glass-tint inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold"
            >
              Collab. <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
