/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        monsoon: {
          50: "#f1f6f3",
          100: "#dde9e2",
          200: "#bdd4c7",
          300: "#93b9a5",
          400: "#619b7f",
          500: "#3f7f60",
          600: "#2f6b50",
          700: "#25553f",
          800: "#173f2e",
          900: "#0f2a1f",
        },
        turmeric: {
          100: "#fdf3d9",
          200: "#fae6a8",
          300: "#f5d36c",
          400: "#f0b93a",
          500: "#e2a829",
          600: "#c48918",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 42 31 / 0.08), 0 1px 2px -1px rgb(15 42 31 / 0.06)",
        "card-hover":
          "0 4px 12px 0 rgb(15 42 31 / 0.12), 0 2px 4px -1px rgb(15 42 31 / 0.08)",
      },
    },
  },
  plugins: [],
};
