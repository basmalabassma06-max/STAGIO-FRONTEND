/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        secondary: '#00C9A7',
        dark: '#0f172a'
      }
    }
  },
  plugins: [],
}