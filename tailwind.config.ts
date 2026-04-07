import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── Brand Colors ──────────────────────────────────────────────────────
      colors: {
        surface: {
          DEFAULT:  '#060d24',
          low:      '#0a122b',
          mid:      '#101828',
          high:     '#151e3c',
          highest:  '#1a2445',
        },
        primary: {
          DEFAULT:  '#3afea0',
          dark:     '#11ec90',
          muted:    '#1a4d38',
        },
        secondary: {
          DEFAULT:  '#ff6b6b',
          muted:    '#4d1f1f',
        },
        success:  '#22c55e',
        gold:     '#f5c842',
        outline: {
          DEFAULT:  '#1a2445',
          variant:  'rgba(26,36,69,0.15)',
        },
        on: {
          primary:  '#060d24',
          surface:  '#ffffff',
          muted:    '#8892aa',
        },
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['"Be Vietnam Pro"', 'sans-serif'],
      },
      fontSize: {
        '2xs':    ['0.625rem', { lineHeight: '1rem' }],
        'xs':     ['0.75rem',  { lineHeight: '1.25rem' }],
        'sm':     ['0.875rem', { lineHeight: '1.5rem' }],
        'base':   ['1rem',     { lineHeight: '1.625rem' }],
        'lg':     ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':     ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl':    ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':    ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl':    ['2.25rem',  { lineHeight: '2.75rem' }],
        '5xl':    ['3rem',     { lineHeight: '1.15' }],
        'display':['3.5rem',   { lineHeight: '1.1' }],
      },
      letterSpacing: {
        label: '0.05em',
        tight: '-0.02em',
      },

      // ── Spacing ───────────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },

      // ── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        'sm':  '0.5rem',
        'md':  '1rem',
        'lg':  '1.5rem',
        'xl':  '2rem',
        'pill':'9999px',
      },

      // ── Box Shadow ────────────────────────────────────────────────────────
      boxShadow: {
        'float':  '0 20px 40px rgba(6,13,36,0.4)',
        'glow':   '0 0 0 4px rgba(58,254,160,0.15)',
        'glow-lg':'0 0 24px rgba(58,254,160,0.25)',
        'card':   '0 4px 24px rgba(6,13,36,0.3)',
        'none':   'none',
      },

      // ── Backdrop Blur ─────────────────────────────────────────────────────
      backdropBlur: {
        'glass': '20px',
      },

      // ── Animation ─────────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'bloom': {
          '0%':   { transform: 'scale(0)', opacity: '1' },
          '60%':  { transform: 'scale(1.4)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.02)' },
        },
        'xp-pop': {
          '0%':   { opacity: '0', transform: 'translateY(0) scale(0.8)' },
          '30%':  { opacity: '1', transform: 'translateY(-12px) scale(1.1)' },
          '100%': { opacity: '0', transform: 'translateY(-32px) scale(1)' },
        },
        'spin-in': {
          '0%':   { transform: 'rotate(-90deg) scale(0.5)', opacity: '0' },
          '100%': { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.4s ease forwards',
        'slide-up':      'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in-right':'slide-in-right 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'bloom':         'bloom 0.6s ease-out forwards',
        'pulse-scale':   'pulse-scale 3s ease-in-out infinite',
        'xp-pop':        'xp-pop 1.2s ease-out forwards',
        'spin-in':       'spin-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':       'shimmer 2s linear infinite',
      },

      // ── Gradients (via backgroundImage) ───────────────────────────────────
      backgroundImage: {
        'primary-gradient':  'linear-gradient(135deg, #3afea0 0%, #11ec90 100%)',
        'surface-gradient':  'linear-gradient(180deg, #060d24 0%, #0a122b 100%)',
        'card-gradient':     'linear-gradient(135deg, #151e3c 0%, #101828 100%)',
        'shimmer-gradient':  'linear-gradient(90deg, transparent 0%, rgba(58,254,160,0.1) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}

export default config
