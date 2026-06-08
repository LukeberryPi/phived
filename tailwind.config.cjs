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
      transitionTimingFunction: {
        "out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
      },
      colors: {
        softWhite: "#f9fafb", // slate50
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
