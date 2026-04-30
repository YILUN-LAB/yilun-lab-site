/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};
