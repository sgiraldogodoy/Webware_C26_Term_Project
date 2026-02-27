/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "media",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#050B14",
        surface: {
          1: "#0B1626",
          2: "#0F2238",
        },
        border: "rgba(255,255,255,0.08)",
        text: {
          1: "#0F172A",
          2: "#475569",
        },
        brand: {
          teal: "slate-teal-500",
          cyan: "slate-600",
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(24,199,193,0.25), 0 0 40px rgba(24,199,193,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

