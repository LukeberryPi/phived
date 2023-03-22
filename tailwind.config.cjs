/* eslint-disable */
/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      tiny: "400px",
      xs: "460px",
      ...defaultTheme.screens,
    },
    colors: {
      alertRed: "#e35454",
      berryBlue: "#79CBE3",
      darkBlack: "#101017",
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
      boxShadow: {
        ["brutalist-dark"]: "3px 3px #080811",
        ["brutalist-light"]: "2px 2px #f1f2f3",
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
