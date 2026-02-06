import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
          subtle: 'var(--accent-subtle)',
        },
        brand: {
          DEFAULT: 'var(--brand)',
          hover: 'var(--brand-hover)',
          muted: 'var(--brand-muted)',
          subtle: 'var(--brand-subtle)',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        pink: {
          500: '#ec4899',
        },
        orange: {
          500: '#f97316',
        },
      },
      backgroundColor: {
        'app': 'var(--bg-app)',
        'surface': 'var(--bg-surface)',
        'elevated': 'var(--bg-elevated)',
        'hover': 'var(--bg-hover)',
        'active': 'var(--bg-active)',
        'muted': 'var(--bg-muted)',
        'inset': 'var(--bg-inset)',
      },
      borderColor: {
        'subtle': 'var(--border-subtle)',
        'default': 'var(--border-default)',
        'strong': 'var(--border-strong)',
        'accent': 'var(--accent)',
        'brand': 'var(--brand)',
      },
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'tertiary': 'var(--text-tertiary)',
        'accent': 'var(--accent)',
        'brand': 'var(--brand)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-lg': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.015em', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow': 'var(--shadow-glow)',
        'glow-brand': '0 0 20px -5px var(--brand)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-up-delay-1': 'fadeUp 0.6s ease-out 0.1s forwards',
        'fade-up-delay-2': 'fadeUp 0.6s ease-out 0.2s forwards',
        'fade-up-delay-3': 'fadeUp 0.6s ease-out 0.3s forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'float': 'float 20s ease-in-out infinite',
        'glow': 'glow 4s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'marquee': 'marquee 40s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(10px, -20px) scale(1.05)' },
          '50%': { transform: 'translate(-5px, 10px) scale(0.95)' },
          '75%': { transform: 'translate(-15px, -10px) scale(1.02)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        borderGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, var(--mesh-1) 0px, transparent 50%), radial-gradient(at 80% 0%, var(--mesh-2) 0px, transparent 50%), radial-gradient(at 0% 80%, var(--mesh-3) 0px, transparent 50%)',
        'gradient-subtle': 'linear-gradient(135deg, var(--gradient-from) 0%, var(--gradient-to) 100%)',
        'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
        'gradient-hero': 'radial-gradient(ellipse 80% 50% at 50% -20%, var(--hero-glow), transparent)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
