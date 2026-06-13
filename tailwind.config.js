/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E3F2FD",
          100: "#BBDEFB",
          200: "#90CAF9",
          300: "#64B5F6",
          400: "#42A5F5",
          500: "#1E88E5",
          600: "#1565C0",
          700: "#0D47A1",
          800: "#0B3D91",
          900: "#071E49",
        },
        dark: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#060B1A",
        },
        success: "#43A047",
        warning: "#FB8C00",
        danger: "#E53935",
        info: "#00ACC1",
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Microsoft YaHei",
          "Noto Sans SC",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "PingFang SC",
          "Microsoft YaHei",
          "Noto Sans SC",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        "card": "0 4px 20px rgba(0, 0, 0, 0.15)",
        "card-hover": "0 8px 30px rgba(30, 136, 229, 0.2)",
        "glow": "0 0 20px rgba(30, 136, 229, 0.4)",
        "inner-glow": "inset 0 0 20px rgba(30, 136, 229, 0.1)",
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
        "gradient-primary": "linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%)",
        "gradient-danger": "linear-gradient(135deg, #E53935 0%, #B71C1C 100%)",
        "gradient-success": "linear-gradient(135deg, #43A047 0%, #2E7D32 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(30, 136, 229, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(30, 136, 229, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};
