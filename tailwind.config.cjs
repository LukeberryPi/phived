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
        // Light-mode neutrals — quiet the interior while the black frame stays bold
        muted: "#71717a", // zinc-500 — secondary text/icons
        line: "#a1a1aa", // zinc-400 — quiet internal borders/dividers
        // Cool, blue-tinted dark-mode palette (applied only behind dark:)
        canvas: "#0a0c10",
        surface: "#14171d",
        surfaceHover: "#1b1f27",
        surfaceActive: "#21262f",
        hairline: "#262b34",
        edge: "#363d49",
        ink: "#e2e5ea",
        inkMuted: "#8b919d",
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
