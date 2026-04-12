/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#00f0ff",
          magenta: "#ff00aa",
          gold: "#ffd700",
        },
        dark: {
          900: "#06060c",
          800: "#0a0a14",
          700: "#12121e",
          600: "#1a1a2e",
          500: "#24243a",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "'Outfit'", "sans-serif"],
        body: ["var(--font-dm-sans)", "'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
