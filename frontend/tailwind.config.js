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
        ink: {
          950: '#060B09',
          900: '#0B1411',
          850: '#0E1A15',
          800: '#12241C',
          700: '#1A3328',
        },
        cream: {
          50: '#FAF7F0',
          100: '#F3EEE1',
          200: '#E8E0C8',
          300: '#D8CBA4',
        },
        gold: {
          200: '#F3E2A9',
          300: '#E9CE7A',
          400: '#DDB84E',
          500: '#C9A227',
          600: '#A8861D',
          700: '#866A15',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'slide-down': 'slideDown 0.8s ease-out forwards',
        'slide-left': 'slideLeft 0.8s ease-out forwards',
        'slide-right': 'slideRight 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
        'rotate-in': 'rotateIn 0.8s ease-out forwards',
        'blur-in': 'blurIn 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'gradient-y': 'gradientY 3s ease infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'shine': 'shine 3.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        rotateIn: {
          '0%': { opacity: '0', transform: 'rotate(-5deg) scale(0.9)' },
          '100%': { opacity: '1', transform: 'rotate(0) scale(1)' },
        },
        blurIn: {
          '0%': { opacity: '0', filter: 'blur(20px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gradientY: {
          '0%, 100%': { backgroundPosition: '50% 0%' },
          '50%': { backgroundPosition: '50% 100%' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shine: {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '60%, 100%': { transform: 'translateX(240%) skewX(-18deg)' },
        },
      },
      backgroundSize: {
        '200%': '200%',
        '300%': '300%',
      },
      boxShadow: {
        'glow': '0 0 42px -10px rgba(16, 185, 129, 0.55)',
        'glow-gold': '0 0 42px -10px rgba(201, 162, 39, 0.55)',
        'inner-glow': 'inset 0 0 40px -10px rgba(16, 185, 129, 0.3)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'premium-dark': '0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(52, 211, 153, 0.12)',
        'card': '0 18px 40px -18px rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
      },
    },
  },
  plugins: [],
}
