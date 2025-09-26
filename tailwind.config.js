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
        // Primary palette - deep blue
        primary: {
          DEFAULT: '#5B89FF',
          50: '#F0F4FF',
          100: '#E1E9FF',
          200: '#C3D3FF',
          300: '#A5BDFF',
          400: '#87A7FF',
          500: '#5B89FF',
          600: '#4572E6',
          700: '#3459B6',
          800: '#2A4694',
          900: '#1F3472',
        },
        // Accent palette - warm orange
        accent: {
          DEFAULT: '#FF7A59',
          50: '#FFF5F2',
          100: '#FFEBE5',
          200: '#FFD7CC',
          300: '#FFC3B2',
          400: '#FFAF99',
          500: '#FF7A59',
          600: '#F06340',
          700: '#E04B26',
          800: '#D1340C',
          900: '#A82A0A',
        },
        // Neutral surfaces
        surface: {
          DEFAULT: '#0D1117',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#0D1117',
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
        'glow': '0 0 20px rgba(91, 137, 255, 0.3)',
        'accent-glow': '0 0 20px rgba(255, 122, 89, 0.3)',
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