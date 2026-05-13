/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'serif'],
        heading: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        muted: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'dialog': '0 20px 60px -12px rgb(0 0 0 / 0.15), 0 8px 24px -6px rgb(0 0 0 / 0.08)',
        'button': '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'nav': '0 1px 3px 0 rgb(0 0 0 / 0.03), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      },
      borderRadius: {
        'card': '0.75rem',
        'button': '0.5rem',
        'input': '0.5rem',
        'dialog': '0.75rem',
      },
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translate(-50%, 1rem)' },
          to: { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-up': 'scale-up 0.2s ease-out',
      },
    },
  },
  zIndex: {
    header: '40',
    dropdown: '45',
    toast: '50',
    modal: '50',
    fab: '55',
    backToTop: '60',
  },
  plugins: [require('@tailwindcss/typography')],
};
