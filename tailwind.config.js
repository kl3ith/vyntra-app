/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: { DEFAULT: '#141414', soft: '#2C2C2A' },
        gold: { light: '#FAC775', DEFAULT: '#BA7517', dark: '#854F0B' },
        warn: '#712B13',
        ink: { light: '#D3D1C7', DEFAULT: '#5F5E5A' },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
