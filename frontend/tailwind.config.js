const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#283D3B',
        teal: '#197278',
        beige: '#EDDDD4',
        terra: '#C44536',
        rust: '#772E25',
      },
    },
  },
  plugins: [],
}

