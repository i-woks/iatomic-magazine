export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["IRANSansX", "system-ui", "sans-serif"] },
      colors: {
        ios: { blue: "var(--color-ios-blue)", "blue-hover": "var(--color-ios-blue-hover)", "blue-soft": "var(--color-ios-blue-soft)", "blue-border": "var(--color-ios-blue-border)" },
        bg: { primary: "var(--color-bg-primary)", secondary: "var(--color-bg-secondary)", tertiary: "var(--color-bg-tertiary)" },
        label: { primary: "var(--color-label-primary)", secondary: "var(--color-label-secondary)", tertiary: "var(--color-label-tertiary)", quaternary: "var(--color-label-quaternary)" },
        fill: { primary: "var(--color-fill-primary)", secondary: "var(--color-fill-secondary)", tertiary: "var(--color-fill-tertiary)", quaternary: "var(--color-fill-quaternary)" },
        separator: { DEFAULT: "var(--color-separator)", opaque: "var(--color-separator-opaque)" },
        science: {
          green: "var(--sci-discovery-green)",
          cyan: "var(--sci-data-cyan)",
          blue: "var(--sci-science-blue)",
          navy: "var(--sci-physics-navy)",
          indigo: "var(--sci-ai-indigo)",
          purple: "var(--sci-ml-purple)",
          violet: "var(--sci-electric-violet)",
          gold: "var(--sci-gold)",
          orange: "var(--sci-focus-orange)",
          red: "var(--sci-energy-red)",
          bio: "var(--sci-bio-green)",
          leaf: "var(--sci-leaf)"
        }
      },
      boxShadow: { ios: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)", "ios-lg": "0 8px 30px rgba(0,0,0,0.12)" },
      borderRadius: { ios: "0.75rem", "ios-lg": "1.125rem" },
      transitionDuration: { 120: "120ms", 240: "240ms" }
    }
  },
  plugins: []
};
