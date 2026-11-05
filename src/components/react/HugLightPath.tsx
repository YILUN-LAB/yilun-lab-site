import { useId } from "react";
import { hug } from "@lib/data/hug";
import drawing from "@lib/data/hug-function-drawing.json";

/**
 * Technical drawing of Hug's light path, drawn only from measurements
 * exported from the digital model (scripts/export-hug-function-drawing.py):
 * a front elevation of the open state and a section through one LED.
 */

type Point = number[];

const INK = "#2f2b27";
const LIGHT = "#d9822b";
const PAPER = "#f2ede4";
const MILKY = "#e3dbcf";

const { elevation, section } = drawing;

const toPath = (points: Point[], close = false) =>
  points.map(([x, z], i) => `${i ? "L" : "M"}${x} ${-z}`).join(" ") + (close ? " Z" : "");

/** Highest point of the outline above x, where a light line ends. */
function topAt(x: number) {
  let top = 0;
  const outline = elevation.outline;
  for (let i = 0; i < outline.length; i++) {
    const [x0, z0] = outline[i];
    const [x1, z1] = outline[(i + 1) % outline.length];
    if ((x0 - x) * (x1 - x) > 0 || x0 === x1) continue;
    top = Math.max(top, z0 + ((x - x0) / (x1 - x0)) * (z1 - z0));
  }
  return top;
}

function Callout({
  n,
  from,
  to,
  size,
  textClass,
}: {
  n: number;
  from: [number, number];
  to: [number, number];
  size: number;
  /** CSS class that sets the font size instead of the size prop (responsive text). */
  textClass?: string;
}) {
  return (
    <g>
      <path
        d={`M${from[0]} ${-from[1]} L${to[0]} ${-to[1]}`}
        stroke={INK}
        strokeWidth={0.6}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={from[0]} cy={-from[1]} r={size * 0.12} fill={INK} />
      <circle
        cx={to[0]}
        cy={-to[1]}
        r={size * 0.62}
        fill={PAPER}
        stroke={INK}
        strokeWidth={0.7}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={to[0]}
        y={-to[1]}
        fontSize={textClass ? undefined : size * 0.72}
        className={textClass}
        textAnchor="middle"
        dominantBaseline="central"
        fill={INK}
        fontFamily="Barlow, sans-serif"
      >
        {n}
      </text>
    </g>
  );
}

/** Dimension line with end ticks; `vertical` measures along z. */
function Dimension({
  a,
  b,
  label,
  size,
  vertical = false,
  labelOffset,
  labelRight = false,
  textClass,
}: {
  a: [number, number];
  b: [number, number];
  label: string;
  size: number;
  vertical?: boolean;
  labelOffset: number;
  /** For spans too short to hold their label: write it past the right end. */
  labelRight?: boolean;
  textClass?: string;
}) {
  const tick = size * 0.35;
  const ticks = vertical
    ? `M${a[0] - tick} ${-a[1]} L${a[0] + tick} ${-a[1]} M${b[0] - tick} ${-b[1]} L${b[0] + tick} ${-b[1]}`
    : `M${a[0]} ${-a[1] - tick} L${a[0]} ${-a[1] + tick} M${b[0]} ${-b[1] - tick} L${b[0]} ${-b[1] + tick}`;
  const mx = (a[0] + b[0]) / 2;
  const mz = (a[1] + b[1]) / 2;
  return (
    <g stroke={INK} strokeWidth={0.6}>
      <path d={`M${a[0]} ${-a[1]} L${b[0]} ${-b[1]} ${ticks}`} vectorEffect="non-scaling-stroke" />
      <text
        x={vertical ? mx + labelOffset : labelRight ? b[0] + labelOffset : mx}
        y={vertical || labelRight ? -mz : -mz - labelOffset}
        fontSize={textClass ? undefined : size * 0.7}
        className={textClass}
        textAnchor={labelRight ? "start" : "middle"}
        dominantBaseline="central"
        fill={INK}
        stroke="none"
        fontFamily="Barlow, sans-serif"
        transform={vertical ? `rotate(-90 ${mx + labelOffset} ${-mz})` : undefined}
      >
        {label}
      </text>
    </g>
  );
}

function Elevation({ id }: { id: string }) {
  const { outline, cavity, leds, islands, board, sensor, guideStart, sectionX } = elevation;
  const xs = outline.map(([x]) => x);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const size = 11;
  const text = "hug-drawing-text";
  const hidden = { strokeDasharray: "4 3", vectorEffect: "non-scaling-stroke" as const };
  return (
    <svg
      viewBox="-175 -335 350 381"
      role="img"
      aria-label={hug.function.drawing.elevation}
      className="h-auto w-full"
    >
      <defs>
        <clipPath id={`${id}-outline`}>
          <path d={toPath(outline, true)} />
        </clipPath>
        <linearGradient
          id={`${id}-fade`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-guideStart}
          x2="0"
          y2={-elevation.height}
        >
          <stop offset="0" stopColor={LIGHT} stopOpacity="0.9" />
          <stop offset="1" stopColor={LIGHT} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <path d={toPath(outline, true)} fill="#f6ead9" />
      <g clipPath={`url(#${id}-outline)`}>
        {leds.map((led) => {
          const x = led.x + led.w / 2;
          return (
            <path
              key={x}
              d={`M${x} ${-(guideStart + 1)} L${x} ${-(topAt(x) - 4)}`}
              stroke={`url(#${id}-fade)`}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              className="hug-light-rise"
            />
          );
        })}
      </g>
      <path
        d={toPath(outline, true)}
        fill="none"
        stroke={INK}
        strokeWidth={1.3}
        vectorEffect="non-scaling-stroke"
      />

      <line
        x1={-170}
        y1={0}
        x2={170}
        y2={0}
        stroke={INK}
        strokeWidth={0.6}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={cavity.x}
        y={-(cavity.z + cavity.h)}
        width={cavity.w}
        height={cavity.h}
        fill="none"
        stroke={INK}
        strokeWidth={0.9}
        vectorEffect="non-scaling-stroke"
      />
      {islands.map((island) => (
        <rect
          key={island.x}
          x={island.x}
          y={-(island.z + island.h)}
          width={island.w}
          height={island.h}
          fill={INK}
          opacity={0.55}
        />
      ))}
      {leds.map((led) => (
        <rect
          key={led.x}
          x={led.x}
          y={-(led.z + led.h)}
          width={led.w}
          height={led.h}
          fill={LIGHT}
        />
      ))}
      <rect
        x={board.x}
        y={-(board.z + board.h)}
        width={board.w}
        height={board.h}
        fill="none"
        stroke={INK}
        strokeWidth={0.7}
        {...hidden}
      />
      <rect
        x={sensor.x}
        y={-(sensor.z + sensor.h)}
        width={sensor.w}
        height={sensor.h}
        fill="none"
        stroke={INK}
        strokeWidth={0.7}
        {...hidden}
      />

      {/* Section line A-A through the middle LED */}
      <g stroke={INK} strokeWidth={0.6}>
        <path
          d={`M${sectionX} 8 L${sectionX} ${-62}`}
          strokeDasharray="10 3 2 3"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={`M${sectionX} 8 L${sectionX} 14 M${sectionX} -62 L${sectionX} -68`}
          strokeWidth={2.2}
          vectorEffect="non-scaling-stroke"
        />
      </g>
      {[20, -74].map((y) => (
        <text
          key={y}
          x={sectionX}
          y={y}
          className={text}
          textAnchor="middle"
          dominantBaseline="central"
          fill={INK}
          fontFamily="Barlow, sans-serif"
          fontWeight={600}
        >
          A
        </text>
      ))}

      <Dimension
        a={[left, 316]}
        b={[right, 316]}
        label={(right - left).toFixed(0)}
        size={size}
        labelOffset={8}
        textClass={text}
      />
      <Dimension
        a={[160, 0]}
        b={[160, elevation.height]}
        label={elevation.height.toFixed(0)}
        size={size}
        vertical
        labelOffset={10}
        textClass={text}
      />

      <Callout n={4} from={[leds[0].x + 1, 5]} to={[-118, -31]} size={size} textClass={text} />
      <Callout n={8} from={[sensor.x + 1.8, 4]} to={[-66, -31]} size={size} textClass={text} />
      <Callout n={7} from={[board.x + board.w - 2, 3]} to={[4, -31]} size={size} textClass={text} />
      <Callout n={6} from={[cavity.x + cavity.w, 7]} to={[62, -31]} size={size} textClass={text} />
    </svg>
  );
}

function SectionAA({ id }: { id: string }) {
  const size = 1.8;
  const cut = 35;
  const shell = section.shell[0];
  const guide = section.guide[0];
  const cavity = section.cavity[0];
  const led = section.led_profile[0];
  const island = section.island[0];
  const guideU = guide.map(([u]) => u);
  const inner = Math.min(...guideU) + 0.15;
  const outer = Math.max(...guideU) - 0.15;
  const ledTop = Math.max(...led.map(([, z]) => z));
  const shellU = shell.map(([u]) => u);
  const shellLeft = Math.min(...shellU);
  const shellRight = Math.max(...shellU);

  const ledU = led.map(([u]) => u);
  const ledCentre = (Math.min(...ledU) + Math.max(...ledU)) / 2;
  const guideBottom = elevation.guideStart;
  // Light leaves the LED, enters the guide's lower edge, then reflects inside it.
  const bounce: Point[] = [
    [ledCentre, ledTop],
    [ledCentre, guideBottom],
  ];
  for (let z = guideBottom + 2.6, side = 1; z < cut - 2; z += 3.4, side ^= 1) {
    bounce.push([side ? outer : inner, z]);
  }
  const exits: Array<[number, number]> = bounce.slice(3).map(([u, z]) => [u, z]);

  const breakLine = `M${shellLeft - 1.2} ${-cut} L${shellLeft + 0.6} ${-cut - 0.8} L${shellRight - 0.6} ${-cut + 0.8} L${shellRight + 1.2} ${-cut}`;

  return (
    <svg
      viewBox="-15 -42 36 48"
      role="img"
      aria-label={hug.function.drawing.section}
      className="h-auto w-full"
    >
      <defs>
        <pattern
          id={`${id}-hatch`}
          width="0.7"
          height="0.7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="0.7" stroke={INK} strokeWidth="0.12" />
        </pattern>
        <clipPath id={`${id}-cut`}>
          <rect x="-15" y={-cut} width="36" height={cut + 6} />
        </clipPath>
        <marker
          id={`${id}-arrow`}
          viewBox="0 0 6 6"
          refX="5"
          refY="3"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L6 3 L0 6 Z" fill={LIGHT} />
        </marker>
      </defs>

      <g clipPath={`url(#${id}-cut)`}>
        <path d={toPath(shell, true)} fill={MILKY} />
        <path d={toPath(guide, true)} fill="#fbf8f2" />
        <path
          d={toPath(shell)}
          fill="none"
          stroke={INK}
          strokeWidth={1.1}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={toPath(guide)}
          fill="none"
          stroke={INK}
          strokeWidth={0.7}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={toPath(bounce)}
          fill="none"
          stroke={LIGHT}
          strokeWidth={1}
          strokeDasharray="0.7 0.6"
          vectorEffect="non-scaling-stroke"
          className="hug-light-bounce"
        />
        {exits.map(([u, z]) => {
          const outward = u < (inner + outer) / 2 ? -1 : 1;
          const start = outward < 0 ? shellLeft : shellRight;
          return (
            <path
              key={z}
              d={`M${u} ${-z} L${start + outward * 2.2} ${-(z + 0.9)}`}
              stroke={LIGHT}
              strokeWidth={0.9}
              opacity={0.75}
              vectorEffect="non-scaling-stroke"
              markerEnd={`url(#${id}-arrow)`}
            />
          );
        })}
      </g>
      <path
        d={breakLine}
        fill="none"
        stroke={INK}
        strokeWidth={0.8}
        vectorEffect="non-scaling-stroke"
      />

      <path d={toPath(cavity, true)} fill={`url(#${id}-hatch)`} />
      <path
        d={toPath(cavity, true)}
        fill="none"
        stroke={INK}
        strokeWidth={1.1}
        vectorEffect="non-scaling-stroke"
      />
      <path d={toPath(island, true)} fill={INK} opacity={0.6} />
      <path d={toPath(led, true)} fill={LIGHT} />
      <line
        x1={-14}
        y1={0}
        x2={20}
        y2={0}
        stroke={INK}
        strokeWidth={0.6}
        vectorEffect="non-scaling-stroke"
      />

      <Dimension
        a={[shellLeft, 30]}
        b={[shellRight, 30]}
        label={(shellRight - shellLeft).toFixed(1)}
        size={size}
        labelOffset={0.9}
        labelRight
      />
      <Dimension
        a={[Math.min(...guideU), 26.5]}
        b={[Math.max(...guideU), 26.5]}
        label={(Math.max(...guideU) - Math.min(...guideU)).toFixed(1)}
        size={size}
        labelOffset={1.4}
        labelRight
      />
      <Dimension a={[-6.5, 0]} b={[-6.5, 10]} label="10" size={size} vertical labelOffset={-1.4} />

      <Callout n={1} from={[shellLeft + 0.25, 21]} to={[-10.5, 21]} size={size} />
      <Callout n={2} from={[(inner + outer) / 2, 18.5]} to={[12.5, 21]} size={size} />
      <Callout n={3} from={[shellRight - 0.25, 15]} to={[12.5, 15]} size={size} />
      <Callout n={6} from={[-2.4, 9]} to={[-10.5, 14]} size={size} />
      <Callout n={4} from={[ledCentre - 0.5, ledTop - 0.4]} to={[-10.5, 7]} size={size} />
      <Callout n={5} from={[ledCentre - 0.9, ledTop - 1.6]} to={[-10.5, 2]} size={size} />
    </svg>
  );
}

export function HugLightPath() {
  const id = useId().replace(/:/g, "");
  const copy = hug.function.drawing;
  return (
    <figure className="overflow-hidden rounded-[1.25rem] bg-[#f2ede4] text-[#2f2b27]">
      <figcaption className="border-b border-[#2f2b27]/15 px-5 py-3 font-body text-[11px] uppercase tracking-[0.18em] md:px-7">
        {copy.title}
      </figcaption>
      <div className="grid gap-6 px-5 pb-2 pt-6 md:grid-cols-[3fr_2fr] md:gap-8 md:px-7">
        <div>
          <Elevation id={id} />
          <p className="mt-2 font-body text-xs">{copy.elevation}</p>
        </div>
        <div className="mx-auto w-full max-w-[18rem] md:max-w-none">
          <SectionAA id={id} />
          <p className="mt-2 font-body text-xs">{copy.section}</p>
        </div>
      </div>
      <div className="grid gap-6 px-5 pb-6 pt-4 md:grid-cols-[3fr_2fr] md:gap-8 md:px-7">
        <div>
          <p className="sr-only">{copy.legendLabel}</p>
          <ol className="grid gap-x-6 gap-y-2 font-body text-[13px] leading-snug sm:grid-cols-2">
            {copy.legend.map((item, index) => (
              <li key={item} className="flex gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#2f2b27] text-[11px]"
                >
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-xl font-body text-xs leading-relaxed text-[#2f2b27]/70">
            {copy.note}
          </p>
        </div>
        <div className="grid h-fit grid-cols-2 self-end border border-[#2f2b27]/40 font-body text-[11px] uppercase tracking-[0.14em]">
          {copy.titleBlock.map((cell, index) => (
            <p
              key={cell}
              className={`px-3 py-2 ${index % 2 ? "border-l" : ""} ${index > 1 ? "border-t" : ""} border-[#2f2b27]/40`}
            >
              {cell}
            </p>
          ))}
        </div>
      </div>
    </figure>
  );
}
