/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0b132b',
          dark: '#060a17',
          light: '#131e40'
        },
        slate: {
          deep: '#1c2541',
          card: '#111827',
          panel: '#151f38',
          border: '#2a3b60',
          hover: '#243252'
        },
        electric: {
          DEFAULT: '#3a86ff',
          hover: '#2574fa',
          glow: 'rgba(58, 134, 255, 0.25)'
        },
        cyan: {
          DEFAULT: '#4cc9f0',
          hover: '#36bbed',
          glow: 'rgba(76, 201, 240, 0.25)'
        },
        risk: {
          low: '#10b981',      // Emerald
          suspicious: '#f59e0b', // Amber
          high: '#ef4444',       // Crimson
          ai: '#ec4899'          // Pink/Fuchsia for AI Gen
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      },
      boxShadow: {
        'glow-electric': '0 0 25px -5px rgba(58, 134, 255, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(76, 201, 240, 0.35)',
        'glow-danger': '0 0 25px -5px rgba(239, 68, 68, 0.35)'
      }
    },
  },
  plugins: [],
}
