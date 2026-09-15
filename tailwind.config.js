/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // AP subject icon colors come from the database at runtime, so Tailwind
    // can't see them in the source — keep them in the build.
    'bg-blue-500', 'bg-blue-600', 'bg-sky-500', 'bg-sky-600', 'bg-green-500',
    'bg-emerald-500', 'bg-emerald-600', 'bg-teal-500', 'bg-teal-600', 'bg-amber-500',
    'bg-amber-600', 'bg-rose-500', 'bg-rose-600', 'bg-red-500', 'bg-red-600',
    'bg-orange-500', 'bg-indigo-500', 'bg-violet-500', 'bg-cyan-500',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#f7fbff',
          100: '#eaf3ff',
          200: '#dcebfb',
          300: '#c6ddf5',
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
          50: '#f1f5fb',
          100: '#e2eaf5',
          200: '#c6d5e8',
          300: '#9db5d6',
          400: '#7893bd',
          500: '#5c789f',
          600: '#46618a',
          700: '#334e72',
          800: '#22395a',
          900: '#13233d',
        },
        ink: '#102a63',
        parchment: '#f5f9ff',
        stone: '#bad6eb',
        wood: '#5b82c9',
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
