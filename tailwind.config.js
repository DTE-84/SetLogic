/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00d9ff',
        'surface-elevated': '#222222',
        success: '#00ff9d',
        warning: '#d4af37',
        'muted-foreground': '#6c757d',
      }
    },
  },
  plugins: [],
}
