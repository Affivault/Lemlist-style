import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Render-inspired minimal palette
        brand: {
          DEFAULT: '#10b981', // Emerald/teal accent
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      backgroundColor: {
        'app': '#0a0a0b',
        'surface': '#111113',
        'elevated': '#191919',
        'hover': 'rgba(255,255,255,0.03)',
        'active': 'rgba(255,255,255,0.05)',
      },
      borderColor: {
        'subtle': 'rgba(255,255,255,0.06)',
        'default': 'rgba(255,255,255,0.08)',
        'strong': 'rgba(255,255,255,0.12)',
      },
      textColor: {
        'primary': '#ffffff',
        'secondary': '#a1a1a1',
        'tertiary': '#666666',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.4)',
        'md': '0 4px 12px rgba(0,0,0,0.4)',
        'lg': '0 8px 24px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
