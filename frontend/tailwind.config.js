/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#030712',
          900: '#0B132B',
          850: '#0F1C3F',
          800: '#172A57',
          700: '#1E3A75'
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
        custom: ['MyCustomFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}