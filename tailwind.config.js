/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Ontop Brand Colors (Updated to match website)
        ontop: {
          // Dark backgrounds - very dark purple/navy
          navy: '#1a0d2e',
          'navy-dark': '#0f0819',
          'navy-light': '#2a1b3d',
          
          // Purple scale
          purple: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          
          // Pink to Coral gradient (for CTAs and highlights)
          pink: {
            50: '#fdf4f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
          },
          
          // Coral/Salmon accent (from the website CTA buttons)
          coral: {
            50: '#fff1f2',
            100: '#ffe4e6',
            200: '#fecdd3',
            300: '#fda4af',
            400: '#fb7185',
            500: '#f43f5e',
            600: '#e11d48',
            700: '#be123c',
            800: '#9f1239',
            900: '#881337',
          },
        }
      },
      backgroundImage: {
        // Main Ontop gradient (purple to pink/coral) - matches website hero
        'gradient-ontop': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f43f5e 100%)',
        'gradient-ontop-hero': 'linear-gradient(120deg, #8b5cf6 0%, #ec4899 50%, #fb7185 100%)',
        
        // Dark background gradient
        'gradient-dark': 'linear-gradient(135deg, #0f0819 0%, #1a0d2e 50%, #2a1b3d 100%)',
        'gradient-navy': 'linear-gradient(180deg, #1a0d2e 0%, #0f0819 100%)',
        
        // CTA button gradient (coral/pink)
        'gradient-cta': 'linear-gradient(90deg, #f43f5e 0%, #ec4899 100%)',
        'gradient-cta-hover': 'linear-gradient(90deg, #e11d48 0%, #db2777 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(168, 85, 247, 0.1)',
      },
      animation: {
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 8px rgba(34, 197, 94, 0)' },
        }
      }
    },
  },
  plugins: [],
}
