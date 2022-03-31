/* eslint-disable no-undef */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  plugins: [],
  theme: {
    extend: {
      colors: {
        brand: {
          white: "#F5FEFA",
          primary: "#17AA67",
          light: "#D1FAE7",
          dark: "#222222"
        }
      }
    },
    fontFamily: {
      sans: ["Poppins", ...defaultTheme.fontFamily.sans]
    }
  }
};
