import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans:    ["'Clash Display'", "'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        body:    ["'Sora'", 'system-ui', 'sans-serif'],
        display: ["'Clash Display'", 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        surface:     'hsl(var(--surface))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        teal: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4',
          300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6',
          600: '#0d9488', 700: '#0f766e', 800: '#115e59',
          900: '#134e4a', 950: '#042f2e',
        },
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        'xs':  ['12px', '16px'],
        'sm':  ['14px', '20px'],
        'base':['16px', '24px'],
        'lg':  ['18px', '26px'],
        'xl':  ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '38px'],
        '4xl': ['36px', '44px'],
      },
      boxShadow: {
        'glow-teal': '0 0 20px -4px rgba(20,184,166,0.25)',
        'glow-sm':   '0 0 12px -2px rgba(20,184,166,0.15)',
        'card':      '0 2px 16px -4px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.04)',
        'float':     '0 8px 32px -8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in':  { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up':  { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer:    { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        'pulse-soft':{ '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':    'fade-in 0.25s ease-out',
        'fade-up':    'fade-up 0.3s ease-out both',
        'slide-up':   'slide-up 0.35s cubic-bezier(0.4,0,0.2,1) both',
        shimmer:      'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
