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
      alertRed: "#e35454",
      berryBlue: "#79CBE3",
      darkBlack: "#111117",
      darkerBlack: "#080811",
      lightWhite: "#fcfcfd",
      lighterWhite: "#fdfdff",
      twitterBlue: "#1DA1F2",
      purpleRain: "#642D80",
      instagramPink: "#d62976",
      instagramPurple: "#962fbf",
      instagramOrange: "#fa7e1e",
    },
    extend: {
      screens: {
        truehover: {
          raw: "(hover: hover)",
        },
      },
    },
    fontFamily: {
      sans: ["DM Sans", "sans-serif"],
      heading: ["DM Sans", "sans-serif"],
    },
  },
  darkMode: "class",
  plugins: [],
};
