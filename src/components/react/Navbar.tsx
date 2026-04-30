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
        const top = el.getBoundingClientRect().top + window.pageYOffset - 20;
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
    { id: "capabilities", label: "Capabilities" },
    { id: "works", label: "Works" },
    { id: "about", label: "About" },
  ];

  function isLinkActive(id: string) {
    if (id === "about" && activePage === "about") return true;
    return false;
  }

  return (
    <>
      <div className="scroll-edge" aria-hidden="true" />
      <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 flex items-center justify-between font-body">
        <button
          onClick={() => jumpTo("top")}
          className="liquid-glass w-12 h-12 flex items-center justify-center rounded-full"
          aria-label="Yilun Lab"
        >
          <span className="font-heading italic text-white text-2xl leading-none lowercase select-none">
            y
          </span>
        </button>

        <div className="liquid-glass hidden md:flex items-center px-1.5 py-1.5 rounded-full">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => jumpTo(l.id)}
              className={
                "glass-link px-3 py-2 text-sm font-medium font-body rounded-full " +
                (isLinkActive(l.id) ? "text-[#fff5e0]" : "text-white/85")
              }
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => jumpTo("collaborate")}
            className={
              "liquid-glass-strong liquid-glass-tint ml-1 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap"
            }
          >
            Collaborate <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="w-12 h-12 invisible" aria-hidden="true" />
      </nav>
    </>
  );
}
