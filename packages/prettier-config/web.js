/** @type {import("prettier").Config} */
module.exports = {
  semi: false,
  singleQuote: true,
  printWidth: 120,
  trailingComma: "es5",
  tailwindFunctions: ["clsx", "tw"],
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
};