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
        // BVP brand palette
        bg:       '#050608',
        surface:  '#0f0f11',
        surface2: '#141416',
        'bvp-border': '#1e1e24',
        orange: {
          DEFAULT: '#ff5e14',
          hover:   '#e54d0a',
          muted:   'rgba(255,94,20,0.12)',
        },
        amber:  '#f5a623',
        green:  '#00e676',
        blue:   '#1E90FF',
        text: {
          DEFAULT: '#f0ede8',
          muted:   '#a8a49e',
          faint:   '#52504e',
        },
        // Legacy vault colors (preserve for existing dashboard)
        vault: {
          bg:         "#0A0F1A",
          surface:    "#111827",
          elevated:   "#1A2235",
          input:      "#151E2D",
          border:     "#1F2E45",
          accent:     "#3B82F6",
          "accent-dim": "#2563EB",
          "accent-glow": "rgba(59,130,246,0.15)",
          green:      "#10B981",
          "green-dim":"#059669",
          amber:      "#F59E0B",
          red:        "#EF4444",
          purple:     "#8B5CF6",
          text:       "#F0F4FF",
          "text-dim": "#8899BB",
          tertiary:   "#4A5A78",
          muted:      "#4A5A78",
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"Familjen Grotesk"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        // Legacy
        syne:   ["'Syne'", "sans-serif"],
        dmsans: ["'DM Sans'", "sans-serif"],
      },
      fontSize: {
        display:    ['80px', { lineHeight: '0.92', letterSpacing: '-1px' }],
        'display-md': ['56px', { lineHeight: '0.95' }],
        'display-sm': ['40px', { lineHeight: '1.0' }],
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(circle, rgba(240,244,255,0.04) 1px, transparent 1px)",
        "grid-pattern":
          "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
        "glow-blue":
          "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
        "glow-cyan":
          "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
        "glow-green":
          "radial-gradient(ellipse at center, rgba(16,185,129,0.10) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid-size": "40px 40px",
        "dot-size":  "20px 20px",
      },
      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in":     "fadeIn 0.5s ease-out forwards",
        "slide-up":    "slideUp 0.4s ease-out forwards",
        "status-pulse":"statusPulse 2s ease-in-out infinite",
        "type-cycle":  "typeCycle 8s infinite",
        "spin-slow":   "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        statusPulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
        typeCycle: {
          "0%, 20%":   { content: '"Invoicing"' },
          "25%, 45%":  { content: '"Reviewing"' },
          "50%, 70%":  { content: '"Writing"' },
          "75%, 95%":  { content: '"Analyzing"' },
          "100%":      { content: '"Invoicing"' },
        },
      },
      boxShadow: {
        "blue-glow": "0 0 0 3px rgba(59,130,246,0.15)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
