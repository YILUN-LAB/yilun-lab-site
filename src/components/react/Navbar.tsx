import { useGlassLensing } from "@lib/glass-lensing";
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

export function Navbar({ mode = "page", activePage = null }: NavbarProps) {
  useGlassLensing();

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

  const links = [
    { id: "selected", label: "Selected" },
    { id: "works", label: "Works" },
    { id: "about", label: "About" },
  ];

  function isLinkActive(id: string) {
    return id === "about" && activePage === "about";
  }

  return (
    <>
      <div className="scroll-edge" aria-hidden="true" />
      <nav className="fixed left-0 right-0 top-4 z-50 flex items-center justify-between px-8 font-body lg:px-16">
        <button
          onClick={() => jumpTo("top")}
          className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full"
          aria-label="Yilun Lab"
        >
          <span className="select-none font-heading text-2xl lowercase italic leading-none text-white">
            y
          </span>
        </button>

        <div className="liquid-glass hidden items-center rounded-full px-1.5 py-1.5 md:flex">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => jumpTo(l.id)}
              className={
                "glass-link rounded-full px-3 py-2 font-body text-sm font-medium " +
                (isLinkActive(l.id) ? "text-[#fff5e0]" : "text-white/85")
              }
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => jumpTo("collaborate")}
            className={
              "liquid-glass-strong liquid-glass-tint ml-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold"
            }
          >
            Collaborate <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="invisible h-12 w-12" aria-hidden="true" />
      </nav>
    </>
  );
}
