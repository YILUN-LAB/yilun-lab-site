import { hug } from "@lib/data/hug";

const curve = "M60 280 C60 215 150 205 150 145 C150 90 80 75 80 20";
const milky = "rgb(244 236 224 / 0.62)";
const clear = "rgb(170 214 210 / 0.55)";
const layerColors = [milky, clear, milky];

/** Section through the proposed laminate: a clear guide between two diffuser skins. */
export function HugLaminateDiagram() {
  const { layers, diagramTitle, diagramNote, ledLabel } = hug.function;

  return (
    <figure className="liquid-glass rounded-[1.25rem] p-6 md:p-8">
      <figcaption className="font-body text-xs uppercase tracking-[0.18em] text-white/55">
        {diagramTitle}
      </figcaption>
      <div className="mt-6 grid items-center gap-8 sm:grid-cols-[minmax(0,11rem)_1fr]">
        <svg
          viewBox="30 0 190 300"
          className="mx-auto h-64 w-auto sm:h-72"
          role="img"
          aria-label={`${diagramTitle}: ${layers.join(", ")}`}
        >
          <defs>
            <radialGradient id="hug-led-glow">
              <stop offset="0" stopColor="rgb(255 196 110)" stopOpacity="0.95" />
              <stop offset="1" stopColor="rgb(255 196 110)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g fill="none" strokeLinecap="round" strokeWidth="10">
            {layerColors.map((color, index) => (
              <path key={index} d={curve} stroke={color} transform={`translate(${index * 16} 0)`} />
            ))}
          </g>
          <path
            d={curve}
            transform="translate(16 0)"
            className="hug-guide-flow"
            fill="none"
            stroke="rgb(255 210 150)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="5 15"
          />
          <circle cx="76" cy="282" r="26" fill="url(#hug-led-glow)" />
          <circle cx="76" cy="282" r="4" fill="rgb(255 222 175)" />
        </svg>
        <div>
          <ul className="space-y-3 font-body text-sm text-white/85">
            {layers.map((layer, index) => (
              <li key={`${layer}-${index}`} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-7 shrink-0 rounded-full"
                  style={{ background: layerColors[index] }}
                />
                {layer}
              </li>
            ))}
            <li className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-[rgb(255_210_150)] shadow-[0_0_10px_rgb(255_196_110)]"
              />
              {ledLabel}
            </li>
          </ul>
          <p className="mt-6 font-body text-xs leading-relaxed text-white/55">{diagramNote}</p>
        </div>
      </div>
    </figure>
  );
}
