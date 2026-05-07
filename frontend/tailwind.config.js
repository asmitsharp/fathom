/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'marine-dark': '#0B192C',
        'marine-panel': '#1A365D',
        'marine-card': 'rgba(26, 54, 93, 0.7)',
        'marine-cyan': '#00B4D8',
        'marine-cyan-hover': '#90E0EF',
        'marine-blue': '#0077B6',
        'marine-muted': '#94A3B8',
        'marine-text': '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
