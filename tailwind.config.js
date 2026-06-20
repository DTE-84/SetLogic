/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background-primary)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        primary: 'var(--kinetic-green)',
        warning: 'var(--warning)',
        success: 'var(--success)',
        muted: {
          foreground: 'var(--text-tertiary)'
        }
      }
    },
  },
  plugins: [],
}
