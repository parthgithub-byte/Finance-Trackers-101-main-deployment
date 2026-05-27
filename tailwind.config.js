/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Enable class-based dark mode
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        'glow-blue': '0 0 8px 2px rgba(59, 130, 246, 0.6)', // matches Tailwind's blue-500
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(59, 130, 246, 0.6)' },
          '50%': { boxShadow: '0 0 12px 4px rgba(59, 130, 246, 1)' },
        },
      },
    },
  },
  plugins: [],
};
