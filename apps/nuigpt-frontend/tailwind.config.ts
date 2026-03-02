/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}", // Important: This lets Tailwind style your shared atoms
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
}