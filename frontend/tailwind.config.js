/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        // Big Sur Glassmorphism Colors
        bigsur: {
          blue: "#2B33C3",
          purple: "#5010B0",
          red: "#C21223",
          darkblue: "#162258",
          darkbg: "#140711",
          mediumbg: "#294B65",
          gray: "#AAB2A6",
        },
        // iOS-inspired colors
        ios: {
          blue: "#007AFF",
          indigo: "#5856D6",
          purple: "#AF52DE",
          pink: "#FF2D55",
          red: "#FF3B30",
          orange: "#FF9500",
          yellow: "#FFCC00",
          green: "#34C759",
          teal: "#5AC8FA",
          gray: {
            100: "#F2F2F7",
            200: "#E5E5EA",
            300: "#D1D1D6",
            400: "#C7C7CC",
            500: "#AEAEB2",
            600: "#8E8E93",
            700: "#636366",
            800: "#48484A",
            900: "#3A3A3C",
            950: "#1C1C1E",
          },
        },
        background: {
          light: "rgba(255, 255, 255, 0.7)",
          dark: "rgba(28, 28, 30, 0.7)",
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },
      backgroundOpacity: {
        15: "0.15",
        35: "0.35",
        85: "0.85",
      },
    },
  },
  plugins: [],
};
