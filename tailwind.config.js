/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: "#C41E1E",
      },
      fontFamily: {
        sans: ["DM Sans", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
