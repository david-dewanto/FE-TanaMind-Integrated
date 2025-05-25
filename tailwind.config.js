/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0B9444',
          dark: '#056526',
          light: '#39B54A',
          bright: '#14AE5C',
        },
        secondary: {
          light: '#DFF3E2',
          lighter: '#CDE0D4',
        },
        gray: {
          dark: '#4D4D4D',
          light: '#D8D8D8',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(11, 148, 68, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(11, 148, 68, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};