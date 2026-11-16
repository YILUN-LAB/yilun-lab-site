import { StrictMode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import DevlogLightbox from "../src/components/react/DevlogLightbox";

let article: HTMLDivElement;

beforeEach(() => {
  article = document.createElement("div");
  article.className = "devlog";
  article.innerHTML = `
    <figure><img src="/first.webp" alt="First picture"><figcaption>First caption</figcaption></figure>
    <figure><img src="/second.webp" alt="Second picture"><figcaption>Second caption</figcaption></figure>
    <div data-viewer></div>`;
  document.body.append(article);
});

afterEach(() => {
  cleanup();
  article.remove();
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
});

function mount(lang: "en" | "zh-Hans" = "en") {
  return render(
    <StrictMode>
      <DevlogLightbox lang={lang} />
    </StrictMode>,
    { container: article.querySelector<HTMLDivElement>("[data-viewer]")! }
  );
}

describe("Devlog image viewer", () => {
  it("opens the clicked picture and navigates the article sequence with its captions", () => {
    mount();
    expect(article.querySelectorAll("figure button")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Second picture" }));
    const dialog = screen.getByRole("dialog", { name: "Development log images" });
    expect(within(dialog).getByRole("img")).toHaveAttribute("alt", "Second picture");
    expect(within(dialog).getByText("Second caption")).toBeInTheDocument();
    expect(within(dialog).getByText("02 / 02")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByRole("img")).toHaveAttribute("alt", "First picture");
    expect(within(dialog).getByText("First caption")).toBeInTheDocument();
    expect(within(dialog).queryByText("Second caption")).not.toBeInTheDocument();
    const surface = within(dialog).getByRole("img").parentElement!;
    fireEvent.touchStart(surface, { touches: [{ clientX: 220, clientY: 100 }] });
    fireEvent.touchEnd(surface, {
      touches: [],
      changedTouches: [{ clientX: 100, clientY: 105 }],
    });
    expect(within(dialog).getByText("Second caption")).toBeInTheDocument();
  });

  it("restores focus and the existing scroll settings when closed", () => {
    document.documentElement.style.overflow = "clip";
    document.body.style.overflow = "auto";
    mount();
    const trigger = screen.getByRole("button", { name: "First picture" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Development log images" });
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(dialog.querySelector<HTMLButtonElement>("[data-lightbox-close]")!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
    expect(document.documentElement.style.overflow).toBe("clip");
    expect(document.body.style.overflow).toBe("auto");
  });

  it("leaves the original inline images and captions when the island unmounts", () => {
    const images = Array.from(article.querySelectorAll("figure img"));
    const { unmount } = mount();
    fireEvent.click(screen.getByRole("button", { name: "First picture" }));
    unmount();
    expect(article.querySelectorAll("figure button")).toHaveLength(0);
    expect(Array.from(article.querySelectorAll("figure > img"))).toEqual(images);
    expect(article.querySelectorAll("figcaption")).toHaveLength(2);
    expect(document.body.style.overflow).toBe("");
  });

  it("uses Chinese viewer controls on the Chinese article", () => {
    mount("zh-Hans");
    fireEvent.click(screen.getByRole("button", { name: "First picture" }));
    const dialog = screen.getByRole("dialog", { name: "开发日志图片" });
    fireEvent.click(within(dialog).getByRole("button", { name: "下一张图片" }));
    expect(within(dialog).getByText("02 / 02")).toBeInTheDocument();
    expect(within(dialog).getByText("Second caption")).toBeInTheDocument();
    expect(dialog.querySelector("[data-lightbox-close]")).toHaveAttribute(
      "aria-label",
      "关闭图片查看器"
    );
  });
});
