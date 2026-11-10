/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aurora: {
          midnight: '#101827',
          navy: '#17243A',
          teal: '#20D9C2',
          cyan: '#63E6E2',
          blue: '#477BFF',
          violet: '#9875FF',
          cloud: '#F4F7FB',
          white: '#FFFFFF',
          amber: '#FFB86B',
          red: '#EF4444',
        },
        health: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#20D9C2',
          600: '#0d9488',
          700: '#0f766e',
          800: '#17243A',
          900: '#101827',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(32, 217, 194, 0.3)',
        'glow-violet': '0 0 25px -5px rgba(152, 117, 255, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(71, 123, 255, 0.3)',
        'premium-card': '0 10px 30px -10px rgba(16, 24, 39, 0.08)',
        'premium-card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
