/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: `"Inter", ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji"`,
      },
      zIndex: {
        '-10': '-10',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        DEFAULT:
          '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
        none: 'none',
      },
      aria: {
        current: 'current="location"',
      },
      colors: {
        twine: {
          50: '#f8f5ee',
          100: '#eee6d3',
          200: '#dfcda9',
          300: '#cdac77',
          400: '#bd9051',
          500: '#ae7d44',
          600: '#956339',
          700: '#784b30',
          800: '#653f2e',
          900: '#58362b',
          950: '#321c16',
        },
        discord: '#536bbd',
      },
    },
  },
}
