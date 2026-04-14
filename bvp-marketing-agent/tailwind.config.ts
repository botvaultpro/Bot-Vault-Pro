import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        orange: {
          500: '#F97316',
          600: '#EA6C0A',
          700: '#C45B08',
        },
        surface: {
          900: '#0A0A0A',
          800: '#111111',
          700: '#1A1A1A',
          600: '#222222',
          500: '#2A2A2A',
          400: '#333333',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#A3A3A3',
          muted: '#6B6B6B',
        },
      },
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
} satisfies Config
