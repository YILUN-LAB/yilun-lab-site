import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SoftBoundaryProject } from "../src/components/react/SoftBoundaryProject";
import { softBoundary } from "../src/lib/data/soft-boundary";

const images = Array.from({ length: 6 }, (_, index) => ({
  src: `/assets/images/projects/soft-boundary/preview-${String(index + 1).padStart(2, "0")}.webp`,
  fullSrc: `/assets/images/projects/soft-boundary/originals/preview-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: `Exhibition view ${index + 1}`,
}));
const cover = "/assets/images/projects/soft-boundary/cover.webp";
const coverFullSrc = "/assets/images/projects/soft-boundary/originals/cover.jpg";
const next = { title: "A Human Permeability", href: "/projects/human-permeability" };

function renderProject(language = "en-US") {
  vi.spyOn(window.navigator, "language", "get").mockReturnValue(language);
  return render(
    <SoftBoundaryProject cover={cover} coverFullSrc={coverFullSrc} images={images} next={next} />
  );
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
  it("renders the cover and six preview photographs once, plus the exhibition flyer", () => {
    renderProject();

    const renderedImages = screen.getAllByRole("img");
    expect(renderedImages).toHaveLength(8);
    expect(screen.getByRole("img", { name: softBoundary.en.coverAlt })).toHaveAttribute(
      "src",
      cover
    );
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

describe("Soft Boundary photo lightbox", () => {
  function openPhoto(index = 0, language = "en-US") {
    renderProject(language);
    const copy = language.startsWith("ja") ? softBoundary.ja : softBoundary.en;
    const trigger = screen.getByRole("button", {
      name: `${copy.lightbox.open}: ${copy.imageAlts[index]}`,
    });
    trigger.focus();
    fireEvent.click(trigger);
    return { trigger, dialog: screen.getByRole("dialog", { name: copy.lightbox.title }) };
  }

  it("opens the selected photo, loads only its original, and loops with buttons and arrow keys", () => {
    const { dialog } = openPhoto(2);
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", images[2].src);
    expect(dialog.querySelector('img[aria-hidden="true"]')).toHaveAttribute(
      "src",
      images[2].fullSrc
    );
    expect(within(dialog).getByText("04 / 07")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: softBoundary.en.lightbox.next }));
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", images[3].src);
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", images[2].src);
    for (let i = 0; i < 4; i++) fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", cover);
    fireEvent.click(
      within(dialog).getByRole("button", { name: softBoundary.en.lightbox.previous })
    );
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", images[5].src);
  });

  it("locks background scrolling, handles native Escape cancellation, and restores the trigger and prior styles", () => {
    document.body.style.overflow = "auto";
    const { dialog, trigger } = openPhoto();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("auto");
    expect(document.documentElement.style.overflow).toBe("");
    document.body.style.overflow = "";
  });

  it("wraps keyboard focus between the close and next controls", () => {
    const { dialog } = openPhoto();
    const close = dialog.querySelector<HTMLButtonElement>("[data-lightbox-close]")!;
    const nextButton = within(dialog).getByRole("button", { name: softBoundary.en.lightbox.next });
    close.focus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(nextButton);
    fireEvent.keyDown(nextButton, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });

  it("keeps the preview usable if the original fails and resets loading when navigating", () => {
    const { dialog } = openPhoto();
    fireEvent.error(dialog.querySelector('img[aria-hidden="true"]')!);
    expect(within(dialog).getByRole("status")).toHaveTextContent(
      softBoundary.en.lightbox.unavailable
    );
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", images[0].src);
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByRole("status")).toHaveTextContent(softBoundary.en.lightbox.loading);
    fireEvent.load(dialog.querySelector('img[aria-hidden="true"]')!);
    expect(within(dialog).getByRole("status")).toBeEmptyDOMElement();
  });

  it("supports horizontal swipes, ignores vertical gestures and uses Japanese controls", () => {
    const { dialog } = openPhoto(0, "ja-JP");
    const photo = within(dialog).getByRole("img");
    fireEvent.touchStart(photo, { touches: [{ clientX: 240, clientY: 100 }] });
    fireEvent.touchEnd(photo, { touches: [], changedTouches: [{ clientX: 60, clientY: 110 }] });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", images[1].src);
    const nextPhoto = within(dialog).getByRole("img");
    fireEvent.touchStart(nextPhoto, { touches: [{ clientX: 240, clientY: 100 }] });
    fireEvent.touchEnd(nextPhoto, {
      touches: [],
      changedTouches: [{ clientX: 200, clientY: 300 }],
    });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", images[1].src);
    fireEvent.click(
      within(dialog).getAllByRole("button", { name: softBoundary.ja.lightbox.close })[1]
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the designated cover and closes from the surrounding backdrop", () => {
    renderProject();
    expect(document.querySelector('img[src$=".jpg"]')).toBeNull();
    fireEvent.click(
      screen.getByRole("button", {
        name: `${softBoundary.en.lightbox.open}: ${softBoundary.en.coverAlt}`,
      })
    );
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", cover);
    expect(dialog.querySelector('img[aria-hidden="true"]')).toHaveAttribute("src", coverFullSrc);
    fireEvent.click(
      within(dialog).getAllByRole("button", { name: softBoundary.en.lightbox.close })[0]
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
