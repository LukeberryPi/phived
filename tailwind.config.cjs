/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['Karla', 'sans-serif'],
      heading: ['Karla', 'sans-serif'],
    }
  },
  plugins: [],
}