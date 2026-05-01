import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#F8F7FB",
          100: "#EDE9F6",
          200: "#C6B7E2",
          300: "#A992D4",
          400: "#8E74C6",
          500: "#7A6AD8",
          600: "#6A57C0",
          700: "#5B4B8A",
          800: "#4A3C72",
          900: "#2E2A3B",
        },
        accent: "#7A6AD8",
        cream: {
          50:  "#FDFCFF",
          100: "#F8F7FB",
          200: "#EDE9F6",
          300: "#D6CEEC",
          400: "#B8A8D8",
          500: "#9A88C4",
        },
      },
      fontFamily: {
        sans:        ["var(--font-poppins)", "Montserrat", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif:       ["Montserrat", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono:        ["ui-monospace", "monospace"],
        poppins:     ["var(--font-poppins)", "sans-serif"],
        staatliches: ["var(--font-staatliches)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "10px",
        sm:  "6px",
        md:  "10px",
        lg:  "14px",
        xl:  "18px",
        "2xl": "22px",
        "3xl": "28px",
        full: "9999px",
      },
      boxShadow: {
        "brand-sm": "0 2px 8px rgba(91, 75, 138, 0.12)",
        "brand":    "0 4px 14px rgba(91, 75, 138, 0.20)",
        "brand-lg": "0 8px 28px rgba(91, 75, 138, 0.25)",
      },
      backgroundImage: {
        "gradient-purple": "linear-gradient(135deg, #5B4B8A 0%, #7A6AD8 100%)",
        "gradient-hero":   "linear-gradient(135deg, #F8F7FB 0%, #EDE9F6 50%, #C6B7E2 100%)",
      },
      maxWidth: {
        "8xl": "1400px",
      },
    },
  },
  plugins: [],
} satisfies Config;

