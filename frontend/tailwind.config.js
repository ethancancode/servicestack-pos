export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#121317',
        'surface-bright': '#38393d',
        'surface-container': '#1e1f23',
        'surface-container-low': '#1a1b1f',
        primary: '#ffffff',
        'primary-container': '#e2e2e2',
        emerald: '#10b981',
        ruby: '#ef4444',
        sapphire: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
