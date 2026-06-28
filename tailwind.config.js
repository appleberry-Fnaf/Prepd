/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fefdfb',
          100: '#fcf7df',
          200: '#f5ecd0',
          300: '#ebe0c0',
        },
        slate: {
          50: '#f8fafb',
          100: '#c7d3db',
          200: '#b0c0ca',
          300: '#9aaeb8',
          400: '#849ba7',
          500: '#6e8895',
          600: '#587584',
          700: '#426273',
          800: '#2c4f62',
          900: '#163c51',
        },
        taupe: {
          50: '#f5f2ef',
          100: '#ebe5de',
          200: '#d4c9bc',
          300: '#a79a8a',
          400: '#8f806e',
          500: '#776753',
          600: '#5f4d3a',
          700: '#473722',
          800: '#3e3630',
          900: '#2a231f',
        },
        ink: '#3e3630',
        parchment: '#fcf7df',
        stone: '#c7d3db',
        wood: '#a79a8a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
