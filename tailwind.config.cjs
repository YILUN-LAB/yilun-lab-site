/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,tsx,ts,jsx,js,mdx,html}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Instrument Serif'", "serif"],
        body: ["'Barlow'", "sans-serif"],
      },
      colors: {
        amber: {
          highlight: "rgb(255 196 110)",
          primary: "rgb(245 175 60)",
          deep: "rgb(200 130 30)",
        },
        warm: { bg: "#0a0705" },
      },
      borderRadius: { DEFAULT: "9999px" },
    },
  },
  plugins: [],
};
