/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        monsoon: {
          50: "#f1f6f3",
          100: "#dde9e2",
          600: "#2f6b50",
          800: "#173f2e",
          900: "#0f2a1f",
        },
        turmeric: {
          400: "#f0b93a",
          500: "#e2a829",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
