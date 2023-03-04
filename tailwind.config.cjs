/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      berryBlue: "#79CBE3",
      petrolBlue: "#037b96",
      sushiWhite: "#f7f7f7",
      snowWhite: "#f1f2f3",
      blackDawn: "#121215",
      blackNight: "#151518",
    },
    extend: {},
    fontFamily: {
      sans: ["DM Sans", "sans-serif"],
      heading: ["DM Sans", "sans-serif"],
    },
  },
  plugins: [],
};
