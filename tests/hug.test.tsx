import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HugProject } from "../src/components/react/HugProject";
import { photoLightboxLabels } from "../src/components/react/PhotoLightbox";
import { hug } from "../src/lib/data/hug";
import drawing from "../src/lib/data/hug-function-drawing.json";

const scenes = [
  {
    src: "/assets/images/projects/hug/scene-01.webp",
    alt: "Morning scene",
    caption: "Morning at the desk",
    width: 1448,
    height: 1086,
  },
  {
    src: "/assets/images/projects/hug/scene-12.webp",
    alt: "Bedside scene",
    caption: "After the last page",
    width: 1448,
    height: 1086,
  },
];

function renderHug() {
  return render(<HugProject scenes={scenes} />);
}

afterEach(cleanup);

describe("Hug product page", () => {
  it("names the product and the award entry", () => {
    renderHug();

    expect(screen.getByRole("heading", { level: 1, name: "Hug" })).toBeInTheDocument();
    expect(screen.getByText(hug.award)).toBeInTheDocument();
  });

  it("lists the three gestures, whose initials quietly spell the name", () => {
    renderHug();

    const list = screen.getByRole("heading", { name: hug.gesturesLabel }).nextElementSibling;
    const words = hug.gestures.map((gesture) => gesture.word);
    expect(words.map((word) => word[0]).join("")).toBe(hug.title.toUpperCase());
    for (const word of words) {
      expect(list).toHaveTextContent(word);
    }
  });

  it("starts in the open state and moves to another state when it is chosen", async () => {
    renderHug();
    const states = screen.getByRole("group", { name: hug.states.heading });

    const open = within(states).getByRole("button", { name: /Open.*4000 K/ });
    const gathered = within(states).getByRole("button", { name: /Gathered.*2200 K/ });
    expect(open).toHaveAttribute("aria-pressed", "true");
    expect(gathered).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(gathered);

    await waitFor(() => expect(gathered).toHaveAttribute("aria-pressed", "true"), {
      timeout: 2000,
    });
    expect(open).toHaveAttribute("aria-pressed", "false");
    const readout = screen.getByTestId("hug-state-readout");
    expect(within(readout).getByText("2200 K")).toBeInTheDocument();
    expect(within(readout).getByText("140 × 128 × 300 mm")).toBeInTheDocument();
  });

  it("warms the light gradually as the opening slider gathers the wings", () => {
    renderHug();
    const slider = screen.getByRole("slider", { name: hug.states.slider.label });

    fireEvent.change(slider, { target: { value: "25" } });

    const readout = screen.getByTestId("hug-state-readout");
    expect(within(readout).getByText("3500 K")).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuetext", "Half-open, 3500 K");
  });

  it("switches the light off and on with the Hold control", () => {
    renderHug();
    const holdButton = screen.getByRole("button", { name: hug.states.hold.label });
    const readout = screen.getByTestId("hug-state-readout");

    fireEvent.click(holdButton);
    expect(holdButton).toHaveAttribute("aria-pressed", "false");
    expect(within(readout).getByText(hug.states.hold.off)).toBeInTheDocument();

    fireEvent.click(holdButton);
    expect(holdButton).toHaveAttribute("aria-pressed", "true");
    expect(within(readout).getByText("4000 K")).toBeInTheDocument();
  });

  it("shows the studio renders when the 3D model cannot run", () => {
    renderHug();

    expect(screen.queryByRole("group", { name: hug.states.views.label })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: hug.states.items[0].image.alt })).toBeInTheDocument();
    expect(screen.getByText(hug.states.renderNote)).toBeInTheDocument();
  });

  it("covers each iF judging criterion with its own section", () => {
    renderHug();

    for (const criterion of hug.criteria) {
      expect(
        screen.getByRole("heading", { level: 3, name: criterion.heading })
      ).toBeInTheDocument();
    }
  });

  it("keeps unpublished drawings and the product film off the page", () => {
    const { container } = renderHug();

    expect(screen.queryByText(hug.development.drawingsLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(hug.development.filmLabel)).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/to be added/i);
  });

  it("does not undersell the entry with caveats about what is untested", () => {
    const { container } = renderHug();

    expect(container.textContent).not.toMatch(
      /not yet claimed|not been tested|still need|to be validated|not yet fixed/i
    );
  });

  it("opens a scene in the photo viewer", () => {
    renderHug();

    fireEvent.click(
      screen.getByRole("button", { name: `${hug.labels.enlarge}: ${scenes[1].alt}` })
    );

    const dialog = screen.getByRole("dialog", { name: photoLightboxLabels.title });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", scenes[1].src);
  });

  it("stands alone under the designer's own name", () => {
    const { container } = renderHug();

    const offPage = screen
      .queryAllByRole("link")
      .filter((link) => !link.getAttribute("href")?.startsWith("#"));
    expect(offPage).toEqual([]);
    expect(screen.getByText(hug.footer)).toBeInTheDocument();
    for (const banned of [/yilun lab/i, /\bR13\b/, /817254/]) {
      expect(container.textContent).not.toMatch(banned);
    }
  });

  it("draws the light path from the model in two views with every part named", () => {
    renderHug();
    const drawing = hug.function.drawing;

    expect(screen.getByRole("img", { name: drawing.elevation })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: drawing.section })).toBeInTheDocument();
    for (const part of drawing.legend) {
      expect(screen.getByText(part.replace(/\u00a0/g, " "))).toBeInTheDocument();
    }
  });
});

describe("Hug copy", () => {
  it("uses no em or en dashes", () => {
    const strings: string[] = [];
    const collect = (value: unknown) => {
      if (typeof value === "string") strings.push(value);
      else if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === "object") Object.values(value).forEach(collect);
    };
    collect(hug);

    expect(strings.filter((text) => /[–—]/.test(text))).toEqual([]);
  });
});

describe("Hug light path data", () => {
  const across = (lines: number[][][], low = -Infinity, high = Infinity) => {
    const us = lines
      .flat()
      .filter(([, z]) => z > low && z < high)
      .map(([u]) => u);
    return {
      min: Math.min(...us),
      max: Math.max(...us),
      centre: (Math.min(...us) + Math.max(...us)) / 2,
    };
  };

  it("places the LED wholly under the light guide's lower edge, on its centre line", () => {
    const guide = across(drawing.section.guide, 7.4, 10.5);
    const led = across(drawing.section.led_profile);

    expect(led.min).toBeGreaterThanOrEqual(guide.min);
    expect(led.max).toBeLessThanOrEqual(guide.max);
    expect(Math.abs(led.centre - guide.centre)).toBeLessThan(0.1);
  });

  it("seats the laminate in the middle of the edge cavity channel, clear of its walls", () => {
    const channel = across(drawing.section.cavity, 2.3, 2.9);
    const laminate = across(drawing.section.shell, 3, 9);
    const island = across(drawing.section.island);

    expect(laminate.min).toBeGreaterThan(channel.min);
    expect(laminate.max).toBeLessThan(channel.max);
    expect(Math.abs(laminate.centre - channel.centre)).toBeLessThan(0.1);
    expect(island.min).toBeGreaterThanOrEqual(channel.min);
    expect(island.max).toBeLessThanOrEqual(channel.max);
  });
});
