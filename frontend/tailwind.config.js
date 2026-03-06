/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A5899',      // Navy blue from template
        secondary: '#7B68B8',    // Purple accent
        accent: {
          mint: '#8CD4C6',       // Mint green
          coral: '#E86B6B',      // Coral red
          purple: '#9B8FD9',     // Light purple
          blue: '#7BA7E1',       // Soft blue
        },
        background: {
          cream: '#F5F1E8',      // Main cream background
          light: '#FDFCF7',      // Lighter variation
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #E5DCC8 1px, transparent 1px), linear-gradient(to bottom, #E5DCC8 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
