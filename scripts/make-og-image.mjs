import sharp from "sharp";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%">
      <stop offset="0%" stop-color="#f5af3c" stop-opacity="0.22"/>
      <stop offset="70%" stop-color="#0a0705" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0705"/>
  <rect width="1200" height="630" fill="url(#g)"/>

  <!-- Brandmark -->
  <svg x="475" y="100" width="250" height="250" viewBox="310 117 180 180">
    <g stroke="#F5C22D" stroke-width="10" stroke-linecap="butt" fill="none">
      <path d="M 340 144 A 60 60 0 0 0 460 144" />
      <path d="M 328 222 A 78 78 0 0 0 472 222" />
      <path d="M 400 203 L 400 271" />
    </g>
  </svg>

  <!-- Wordmark -->
  <text x="600" y="430" text-anchor="middle"
        font-family="'Montserrat', 'Trebuchet MS', 'Arial', sans-serif"
        font-size="56" font-weight="500" letter-spacing="0.5em" fill="#F5C22D">YILUN LAB</text>

  <!-- Tagline (italic serif, matches the rest of the site's voice) -->
  <text x="600" y="510" text-anchor="middle"
        font-family="Georgia, 'Instrument Serif', serif" font-style="italic"
        font-size="32" fill="#fff5e0">Light. Emotion. Future.</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile("public/og-image.jpg");

console.log("public/og-image.jpg written");
