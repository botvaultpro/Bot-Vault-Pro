import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#07070E",
          surface: "#0F0F1A",
          border: "#1A1A2E",
          accent: "#00E5FF",
          "accent-dim": "#00B8CC",
          green: "#00FF88",
          "green-dim": "#00CC6E",
          muted: "#4A4A6A",
          text: "#E8E8F0",
          "text-dim": "#8888AA",
        },
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
        "glow-cyan":
          "radial-gradient(ellipse at center, rgba(0,229,255,0.15) 0%, transparent 70%)",
        "glow-green":
          "radial-gradient(ellipse at center, rgba(0,255,136,0.12) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid-size": "40px 40px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
