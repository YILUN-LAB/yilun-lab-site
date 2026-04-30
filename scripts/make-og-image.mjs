import sharp from "sharp";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%">
      <stop offset="0%" stop-color="#f5af3c" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="#0a0705" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0705"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="600" y="320" text-anchor="middle"
        font-family="Georgia, serif" font-style="italic"
        font-size="110" fill="#ffffff">YILUN LAB</text>
  <text x="600" y="395" text-anchor="middle"
        font-family="Georgia, serif" font-style="italic"
        font-size="40" fill="#fff5e0">Light. Emotion. Future.</text>
</svg>`;

await sharp(Buffer.from(svg))
  .jpeg({ quality: 85 })
  .toFile("public/og-image.jpg");

console.log("public/og-image.jpg written");
