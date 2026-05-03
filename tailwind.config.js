/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0E17',
        'bg-secondary': '#111827',
        'bg-tertiary': '#1C2333',
        'border-color': '#2A3A5C',
        'accent-blue': '#3B82F6',
        'accent-cyan': '#06B6D4',
        'accent-green': '#10B981',
        'accent-red': '#EF4444',
        'accent-amber': '#F59E0B',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        sans: ['IBM Plex Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
