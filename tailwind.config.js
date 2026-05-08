/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary — warm sage
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#6b9080',
          600: '#5a7d6e',
          700: '#4a6a5c',
          800: '#3d5a4e',
          900: '#334d42',
        },
        // Secondary — warm stone
        secondary: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        // Accent — soft amber
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4a574',
          600: '#b8956a',
          700: '#9c7f5a',
          800: '#80694a',
          900: '#64533a',
        },
        // Cycle phase colors
        menstruation: '#c97b7b',
        follicular: '#7ba5c9',
        ovulation: '#c9b87b',
        luteal: '#9b7bc9',
        fertile: '#7bc9a5',
        // Semantic
        success: '#6b9080',
        warning: '#d4a574',
        error: '#c97b7b',
        info: '#7ba5c9',
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};