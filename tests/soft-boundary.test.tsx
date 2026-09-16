import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SoftBoundaryProject } from "../src/components/react/SoftBoundaryProject";
import { softBoundary } from "../src/lib/data/soft-boundary";

const images = Array.from({ length: 13 }, (_, index) => ({
  src: `/assets/images/projects/soft-boundary/installation-${String(index + 1).padStart(2, "0")}.webp`,
  alt: `Exhibition view ${index + 1}`,
}));
const next = { title: "A Human Permeability", href: "/projects/human-permeability" };

function renderProject(language = "en-US") {
  vi.spyOn(window.navigator, "language", "get").mockReturnValue(language);
  return render(<SoftBoundaryProject images={images} next={next} />);
}

beforeEach(() => {
  document.documentElement.lang = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Soft Boundary project language", () => {
  it.each([
    ["ja-JP", "ja", "やわらかな境界", "日本語"],
    ["en-US", "en", "Soft Boundary", "English"],
    ["zh-CN", "en", "Soft Boundary", "English"],
  ])("uses %s as the device language", (deviceLanguage, projectLanguage, title, button) => {
    renderProject(deviceLanguage);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute("lang", projectLanguage);
    expect(screen.getByRole("button", { name: button })).toHaveAttribute("aria-current", "true");
    expect(document.documentElement.lang).toBe("en");
  });

  it("switches project content and image descriptions without changing the site language or saving a preference", () => {
    const savePreference = vi.spyOn(Storage.prototype, "setItem");
    renderProject();

    fireEvent.click(screen.getByRole("button", { name: "日本語" }));

    expect(screen.getByRole("article")).toHaveAttribute("lang", "ja");
    expect(screen.getByRole("heading", { level: 1, name: "やわらかな境界" })).toBeInTheDocument();
    expect(screen.getByText("2026年9月15日（火）から9月19日（土）")).toBeInTheDocument();
    expect(screen.getByText("最終日の9月19日（土）は12:00から16:00まで")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "展覧会フライヤー" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: softBoundary.ja.imageAlts[0] })).toHaveAttribute(
      "src",
      images[0].src
    );
    expect(screen.getByRole("img", { name: softBoundary.ja.flyer.previewAlt })).toBeInTheDocument();
    expect(screen.queryByText(softBoundary.en.dates)).not.toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");

    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByRole("article")).toHaveAttribute("lang", "en");
    expect(screen.getByRole("heading", { level: 1, name: "Soft Boundary" })).toBeInTheDocument();
    expect(screen.getByText("15 to 19 September 2026 (Tuesday to Saturday)")).toBeInTheDocument();
    expect(screen.getByText("19 September: 12:00 to 16:00")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Exhibition flyer" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: softBoundary.en.imageAlts[0] })).toHaveAttribute(
      "src",
      images[0].src
    );
    expect(document.documentElement.lang).toBe("en");
    expect(savePreference).not.toHaveBeenCalled();
  });
});

describe("Soft Boundary exhibition assets and navigation", () => {
  it("renders all 13 installation photographs once, plus the exhibition flyer", () => {
    renderProject();

    const renderedImages = screen.getAllByRole("img");
    expect(renderedImages).toHaveLength(14);
    images.forEach((image, index) => {
      expect(
        renderedImages.filter((element) => element.getAttribute("src") === image.src)
      ).toHaveLength(1);
      expect(screen.getByRole("img", { name: softBoundary.en.imageAlts[index] })).toHaveAttribute(
        "src",
        image.src
      );
    });
  });

  it("displays the flyer without a download link and preserves the next-work destination", () => {
    renderProject();

    const flyer = screen.getByRole("img", { name: softBoundary.en.flyer.previewAlt });
    expect(flyer.closest("a")).toBeNull();
    expect(document.querySelector("a[download]")).toBeNull();
    expect(screen.queryByText("Downloads")).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("navigation", { name: "Next work" })).getByRole("link", {
        name: next.title,
      })
    ).toHaveAttribute("href", next.href);
  });
});
