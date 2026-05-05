/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This overwrites font-sans to use Manrope everywhere
        sans: ['Manrope', 'sans-serif'],
        // This overwrites font-serif to use Raleway everywhere
        serif: ['Raleway', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}