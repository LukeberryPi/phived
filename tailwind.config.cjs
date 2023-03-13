/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "480px",
      ...defaultTheme.screens,
    },
    colors: {
      berryBlue: "#79CBE3",
      petrolBlue: "#254F66",
      blackDawn: "#080810",
      blackNight: "#111117",
      snowWhite: "#fcfcff",
      sushiWhite: "#fbfbfd",
    },
    extend: {},
    fontFamily: {
      sans: ["DM Sans", "sans-serif"],
      heading: ["DM Sans", "sans-serif"],
    },
  },
  darkMode: "class",
  plugins: [],
};
