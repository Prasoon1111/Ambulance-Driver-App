/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        border: "#e5e7eb",
        background: "#f8fafc",
        foreground: "#0f172a",
        muted: "#f1f5f9",
        "muted-foreground": "#64748b",
        primary: "#0f172a",
        "primary-foreground": "#ffffff",
        accent: "#eef2ff",
        "accent-foreground": "#3730a3",
        destructive: "#dc2626",
        success: "#0f8f5f",
        warning: "#b45309",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
