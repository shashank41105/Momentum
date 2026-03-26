import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Space Grotesk'", "ui-sans-serif", "sans-serif"],
        display: ["'Sora'", "ui-sans-serif", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
