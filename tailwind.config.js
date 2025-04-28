import { heroui } from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      // overwrite heroui colors
      colors: {
        ...heroui.colors,
        primary: '#3C7DD1',
        secondary: '#FFBC34',
        warning: '#FFBC34',
        yellow: {
          300: '#FFE5B1',
          400: '#FED174',
        }
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;