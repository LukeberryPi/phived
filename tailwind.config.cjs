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
        alertRed: "#E35454",
        berryBlue: "#79CBE3",
        dailyGreen: "#64E9CF",
        softBlack: "#101018",
        trueBlack: "#080811",
        softWhite: "#FCFCFD",
        trueWhite: "#FDFDFF",
        twitterBlue: "#1DA1F2",
        purpleRain: "#642D80",
        instagramPink: "#D62976",
        instagramPurple: "#962FBF",
        instagramOrange: "#FA7E1E",
        unavailableLight: "#E8E8ED",
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
