import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";

// `@keystatic/astro/ui` reads `import.meta.env` at module load. In the
// vitest happy-dom environment those env vars are undefined and the
// module throws. Stub it before importing AdminShell so the banner can
// be tested in isolation from Keystatic's own UI.
vi.mock("@keystatic/astro/ui", () => ({
  makePage: () => () => null,
}));

import { AdminShell } from "../src/components/keystatic/AdminShell";

describe("AdminShell main-branch warning banner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  function setPath(p: string) {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, pathname: p },
    });
  }

  it("hides the banner when on staging branch", () => {
    setPath("/keystatic/branch/staging/projects");
    render(
      <AdminShell>
        <div>content</div>
      </AdminShell>
    );
    expect(screen.queryByText(/editing main directly/i)).not.toBeInTheDocument();
  });

  it("shows the banner when on main branch", () => {
    setPath("/keystatic/branch/main/projects");
    render(
      <AdminShell>
        <div>content</div>
      </AdminShell>
    );
    expect(screen.getByText(/editing main directly/i)).toBeInTheDocument();
  });

  it("updates when pathname changes (Keystatic SPA navigation)", () => {
    setPath("/keystatic/branch/staging/");
    render(
      <AdminShell>
        <div>content</div>
      </AdminShell>
    );
    expect(screen.queryByText(/editing main directly/i)).not.toBeInTheDocument();

    act(() => {
      setPath("/keystatic/branch/main/");
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText(/editing main directly/i)).toBeInTheDocument();
  });
});
