/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette (from brand)
        navy: {
          900: "#021219",
          800: "#051a25",
          700: "#082334",
          600: "#0c2e41",
          500: "#14415a",
        },
        jukebox: {
          red: "#c4302a",
          "red-dark": "#8a1e19",
          "red-light": "#e04a42",
        },
        cream: {
          DEFAULT: "#e9d7a5",
          50: "#f6ebc9",
          100: "#f0e2b7",
          200: "#e9d7a5",
          300: "#d6c28d",
          400: "#bfa771",
          500: "#a28b5a",
          700: "#5a3a20",
          800: "#3a2416",
          900: "#1a0f0a",
        },
        brass: {
          DEFAULT: "#d4a94b",
          light: "#f4c869",
          dark: "#9a7a2e",
        },
        chrome: {
          DEFAULT: "#cbcdd2",
          light: "#e8e9ec",
          dark: "#7a7d83",
        },
        // Back-compat aliases (map old neon palette onto new vintage palette)
        neon: {
          cyan: "#e9d7a5",     // cream replaces cyan highlights
          magenta: "#c4302a",  // jukebox red replaces magenta
          gold: "#f4c869",     // brass gold
        },
        dark: {
          900: "#021219",
          800: "#051a25",
          700: "#082334",
          600: "#0c2e41",
          500: "#14415a",
        },
      },
      fontFamily: {
        display: ["var(--font-abril)", "'Abril Fatface'", "serif"],
        serif: ["var(--font-playfair)", "'Playfair Display'", "serif"],
        label: ["var(--font-bebas)", "'Bebas Neue'", "sans-serif"],
        body: ["var(--font-inter)", "'Inter'", "sans-serif"],
      },
      backgroundImage: {
        "paper-grad":
          "linear-gradient(180deg, #f0e2b7 0%, #e9d7a5 50%, #d6c28d 100%)",
        "chrome-grad":
          "linear-gradient(145deg, #f0f1f3 0%, #b8babf 35%, #e8e9ec 55%, #7a7d83 100%)",
        "red-grad":
          "linear-gradient(to bottom, #e7413a 0%, #c4302a 55%, #8a1e19 100%)",
        "brass-grad":
          "linear-gradient(to bottom, #f4c869 0%, #d4a94b 55%, #9a7a2e 100%)",
      },
    },
  },
  plugins: [],
};
