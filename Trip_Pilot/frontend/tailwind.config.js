/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E6',
        'cream-dark': '#EDE5D6',
        navy: '#1C1C2E',
        'navy-light': '#2d2d44',
        primary: '#5B4BBE',
        'primary-dark': '#4A3CA8',
        'primary-light': '#7C6FD4',
        accent: '#F59E0B',
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
