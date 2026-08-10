/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f5fa',
          100: '#e0ebf4',
          200: '#c5dbe9',
          300: '#9ec1da',
          400: '#71a0c8',
          500: '#5185b5',
          600: '#3f6a97',
          700: '#33557a',
          800: '#2d4865',
          900: '#142c44', // Deep Ocean Blue
        },
        sand: {
          50: '#fcfaf6',
          100: '#f8f4eb',
          200: '#f0e3ce',
          300: '#e5cdab',
          400: '#d7b282',
          500: '#cb975f',
          600: '#bd7f4a',
          700: '#9d643e',
          800: '#805336',
          900: '#67442e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
