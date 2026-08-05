import tailwindForms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Nepal Opportunity Map design tokens
        // Ground in Nepal's geography: Himalayan peaks, Sal forests, rice terraces, rivers
        peak: {
          50:  '#e8eef2',
          100: '#c5d4dc',
          200: '#9fb9c5',
          300: '#789dae',
          400: '#5b899c',
          500: '#3e748b',
          600: '#2d6070',
          700: '#1B3A4B', // primary dark — deep Himalayan slate
          800: '#102535',
          900: '#07131d',
        },
        ridge: {
          50:  '#e6f4ee',
          100: '#c0e3d1',
          200: '#96d1b2',
          300: '#6cbf93',
          400: '#4cb17b',
          500: '#2D6A4F', // Sal forest green
          600: '#255c44',
          700: '#1c4c37',
          800: '#133c2a',
          900: '#0a2c1d',
        },
        terraced: {
          50:  '#ebf7f2',
          100: '#c8ecdf',
          200: '#a4e0cb',
          300: '#80d4b7',
          400: '#67cba7',
          500: '#52B788', // rice-terrace teal — primary accent
          600: '#3d9e72',
          700: '#2d845e',
          800: '#1e6a4a',
          900: '#0f5036',
        },
        saffron: {
          50:  '#fef8f0',
          100: '#fdecd9',
          200: '#fbd9b3',
          300: '#f8c68d',
          400: '#f6b674',
          500: '#F4A261', // marigold/festival warm highlight
          600: '#e8864a',
          700: '#cc6a33',
          800: '#b0511f',
          900: '#943a0e',
        },
        mist: {
          50:  '#f0f8fd',
          100: '#d8eef8',
          200: '#b8e0f2',
          300: '#8ECAE6', // river/sky data layer
          400: '#6db8da',
          500: '#4da6ce',
          600: '#3d8fb5',
          700: '#2f759a',
          800: '#215c7f',
          900: '#144364',
        },
        cloud: '#F0F4F8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'boundary-pulse': 'boundaryPulse 2.5s ease-in-out infinite',
        'counter-up': 'counterUp 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        boundaryPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        counterUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(27,58,75,0.08), 0 4px 16px rgba(27,58,75,0.06)',
        'card-hover': '0 4px 24px rgba(27,58,75,0.14), 0 1px 4px rgba(27,58,75,0.08)',
        'panel': '0 8px 32px rgba(27,58,75,0.12)',
        'glow-terraced': '0 0 20px rgba(82,183,136,0.3)',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.5rem',
      },
      backgroundImage: {
        'gradient-himalaya': 'linear-gradient(135deg, #1B3A4B 0%, #2D6A4F 50%, #52B788 100%)',
        'gradient-hero': 'linear-gradient(160deg, #07131d 0%, #1B3A4B 40%, #2D6A4F 100%)',
      },
    },
  },
  plugins: [
    tailwindForms({
      strategy: 'class',
    }),
  ],
}
