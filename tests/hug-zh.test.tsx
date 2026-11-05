import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HugProject } from "../src/components/react/HugProject";
import { hug } from "../src/lib/data/hug";
import { hugZh, hugZhScenes } from "../src/lib/data/hug.zh";

const scenes = [
  {
    src: "/assets/images/projects/hug/scene-12.webp",
    ...hugZhScenes["scene-12.webp"],
    width: 1448,
    height: 1086,
  },
];

function renderZh() {
  return render(<HugProject scenes={scenes} copy={hugZh} />);
}

afterEach(cleanup);

describe("Hug Chinese page", () => {
  it("marks the page as Chinese and keeps the product name", () => {
    const { container } = renderZh();

    expect(container.querySelector("article")).toHaveAttribute("lang", "zh-Hans");
    expect(screen.getByRole("heading", { level: 1, name: "Hug" })).toBeInTheDocument();
    expect(screen.getByText(hugZh.award)).toBeInTheDocument();
  });

  it("keeps the English gestures that spell the name, with a Chinese gloss", () => {
    renderZh();

    const list = screen.getByRole("heading", { name: hugZh.gesturesLabel }).nextElementSibling;
    expect(hugZh.gestures.map((g) => g.word[0]).join("")).toBe("HUG");
    for (const gesture of hugZh.gestures) {
      expect(list).toHaveTextContent(gesture.word);
      expect(list).toHaveTextContent(gesture.gloss ?? "");
    }
  });

  it("moves between the three states with Chinese names", async () => {
    renderZh();
    const states = screen.getByRole("group", { name: hugZh.states.heading });
    const gathered = within(states).getByRole("button", { name: /合拢.*2200 K/ });

    fireEvent.click(gathered);

    await waitFor(() => expect(gathered).toHaveAttribute("aria-pressed", "true"), {
      timeout: 2000,
    });
    const readout = screen.getByTestId("hug-state-readout");
    expect(readout).toHaveTextContent(
      `${hugZh.states.items[2].name}${hugZh.states.nameStop}${hugZh.states.items[2].description}`
    );
  });

  it("switches the light with the Chinese hold control", () => {
    renderZh();
    const holdButton = screen.getByRole("button", { name: hugZh.states.hold.label });

    fireEvent.click(holdButton);

    expect(holdButton).toHaveAttribute("aria-pressed", "false");
    const readout = screen.getByTestId("hug-state-readout");
    expect(within(readout).getByText(hugZh.states.hold.off)).toBeInTheDocument();
  });

  it("covers each iF criterion in Chinese", () => {
    renderZh();

    for (const criterion of hugZh.criteria) {
      expect(
        screen.getByRole("heading", { level: 3, name: criterion.heading })
      ).toBeInTheDocument();
    }
  });

  it("links only to the English page", () => {
    renderZh();

    const offPage = screen
      .queryAllByRole("link")
      .filter((link) => !link.getAttribute("href")?.startsWith("#"));
    expect(offPage).toHaveLength(1);
    expect(offPage[0]).toHaveAttribute("href", "/projects/hug");
    expect(offPage[0]).toHaveAttribute("hreflang", "en");
  });

  it("stays under the designer's own name, without caveats", () => {
    const { container } = renderZh();

    for (const banned of [/yilun lab/i, /\bR13\b/, /817254/, /尚未验证|未经测试|有待验证/]) {
      expect(container.textContent).not.toMatch(banned);
    }
  });

  it("opens the photo viewer with Chinese labels", () => {
    renderZh();

    fireEvent.click(
      screen.getByRole("button", { name: `${hugZh.labels.enlarge}: ${scenes[0].alt}` })
    );

    expect(screen.getByRole("dialog", { name: hugZh.lightbox?.title })).toBeInTheDocument();
  });
});

describe("Hug Chinese copy", () => {
  /** Leaves of an object: numbers and image or model paths, keyed by path. */
  function sharedValues(value: unknown, path = "", out: Record<string, unknown> = {}) {
    if (typeof value === "number") out[path] = value;
    else if (typeof value === "string" && value.startsWith("/assets/")) out[path] = value;
    else if (Array.isArray(value)) value.forEach((v, i) => sharedValues(v, `${path}[${i}]`, out));
    else if (value && typeof value === "object") {
      for (const [key, v] of Object.entries(value)) sharedValues(v, `${path}.${key}`, out);
    }
    return out;
  }

  it("shares every number, image and model path with the English copy", () => {
    expect(sharedValues(hugZh)).toEqual(sharedValues(hug));
  });

  it("has the same sections and list lengths as the English copy", () => {
    const shape = (value: unknown): unknown =>
      Array.isArray(value)
        ? value.map(shape)
        : value && typeof value === "object"
          ? Object.fromEntries(
              Object.entries(value)
                .filter(([key]) => !["gloss", "lightbox", "languageLink"].includes(key))
                .map(([key, v]) => [key, shape(v)])
            )
          : typeof value;

    expect(shape(hugZh)).toEqual(shape(hug));
  });

  it("translates every scene render listed in the project entry", () => {
    const mdx = readFileSync("src/content/projects/hug.mdx", "utf8");
    const files = [...mdx.matchAll(/src: \/assets\/images\/projects\/hug\/(scene-\d+\.webp)/g)].map(
      (match) => match[1]
    );

    expect(files.length).toBeGreaterThan(0);
    expect(Object.keys(hugZhScenes).sort()).toEqual(files.sort());
  });

  it("uses no em or en dashes", () => {
    const text = JSON.stringify({ hugZh, hugZhScenes });

    expect(text).not.toMatch(/[–—]/);
  });
});
