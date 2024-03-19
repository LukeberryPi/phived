/* eslint-disable */
/** @type {import('tailwindcss').Config} */

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
        dailyPurple: "#A855F7", // purple-500 not enough contrast with white
        softWhite: "#f8fafc", // slate50
        trueWhite: "#fff", // slate50
        purpleRain: "#581C87", // purple-900 not enough contrast with black
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
