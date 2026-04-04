import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"]
      },
      colors: {
        canvas: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          container: "var(--surface-container)",
          soft: "var(--surface-soft)",
          muted: "var(--surface-muted)",
          dim: "var(--surface-dim)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          container: "var(--accent-container)",
          text: "var(--accent-text)"
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)"
        }
      },
      borderRadius: {
        "card": "1.75rem",
        "card-sm": "1.25rem"
      },
      animation: {
        "fade-in": "fade-in 450ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "fade-in-up": "fade-in-up 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "shimmer": "shimmer 1.8s infinite"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { "background-position": "-200% 0" },
          "100%": { "background-position": "200% 0" }
        }
      }
    }
  },
  plugins: []
};

export default config;
