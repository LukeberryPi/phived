/* eslint-disable */
/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        tiny: "400px",
        xs: "500px",
      },
      boxShadow: {
        ["brutalist-dark"]: "3px 3px #080811",
        ["brutalist-light"]: "2px 2px #fdfdff",
      },
      colors: {
        alertRed: "#e35454",
        berryBlue: "#79cbe3",
        softBlack: "#101018",
        trueBlack: "#080811",
        softWhite: "#fcfcfd",
        trueWhite: "#fdfdff",
        twitterBlue: "#1da1f2",
        purpleRain: "#642d80",
        instagramPink: "#d62976",
        instagramPurple: "#962fbf",
        instagramOrange: "#fa7e1e",
        unavailableLight: "#dedee0",
        unavailableDark: "#202028",
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
