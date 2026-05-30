/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF6F1",
        foreground: "#072547",
        primary: {
          DEFAULT: "#FF7058",
          foreground: "#FFFFFF",
          dark: "#072547",
        },
        navy: "#072547",
        coral: "#FF7058",
        sky: "#7DC9E8",
        sage: "#8FB9A8",
        cream: "#FAF6F1",
        surface: "#FFFFFF",
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        border: "#E5E0D8",
        input: "#E5E0D8",
        ring: "#FF7058",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(7,37,71,0.06), 0 1px 2px -1px rgba(7,37,71,0.04)",
        "card-hover": "0 4px 12px 0 rgba(7,37,71,0.10)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-soft": "bounceSoft 0.5s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(12px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        bounceSoft: { "0%, 100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.05)" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
