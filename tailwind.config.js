/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary palette - electric violet
        primary: {
          DEFAULT: '#7C5CFF',
          50: '#F4F1FF',
          100: '#E9E3FF',
          200: '#D4C8FF',
          300: '#B9A5FF',
          400: '#9D82FF',
          500: '#7C5CFF',
          600: '#6A45F0',
          700: '#5533C9',
          800: '#43289E',
          900: '#331E78',
        },
        // Accent palette - punchy coral
        accent: {
          DEFAULT: '#FF5436',
          50: '#FFF3F0',
          100: '#FFE4DE',
          200: '#FFC9BD',
          300: '#FFA68F',
          400: '#FF7D5F',
          500: '#FF5436',
          600: '#ED3E20',
          700: '#C72F16',
          800: '#9E2717',
          900: '#7E2418',
        },
        // Neutral surfaces - deep charcoal w/ cool undertone
        surface: {
          DEFAULT: '#0C0B10',
          50: '#F7F7FA',
          100: '#EFEFF4',
          200: '#D9D9E3',
          300: '#B8B8C9',
          400: '#8E8EA3',
          500: '#6E6E85',
          600: '#585870',
          700: '#3B3B4F',
          800: '#23222E',
          900: '#14131B',
          950: '#0C0B10',
        },
        // Text colors
        ink: {
          DEFAULT: '#0B1220',
          50: '#F8FAFC',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#64748B',
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#0F172A',
          900: '#0B1220',
        },
        // Feedback colors
        success: '#22C55E',
        warning: '#F59E0B', 
        danger: '#EF4444',
        info: '#3B82F6',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'soft': '0 6px 24px rgba(0, 0, 0, 0.14)',
        'glow': '0 0 20px rgba(124, 92, 255, 0.35)',
        'accent-glow': '0 0 20px rgba(255, 84, 54, 0.35)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce-soft 1s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'bounce-soft': {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': { 
            transform: 'translateY(-8px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(16px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scale-in': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
}