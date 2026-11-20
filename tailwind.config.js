/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#080c14',
          surface: '#0d1524',
          card: '#131e33',
          border: '#1f2e4d',
          highlight: '#2a3d66',
        },
        traffic: {
          low: '#10b981',       // Green
          moderate: '#facc15',  // Yellow
          high: '#f97316',      // Orange
          severe: '#ef4444',    // Red
        },
        aqi: {
          good: '#10b981',        // 0-50 Green
          satisfactory: '#84cc16',// 51-100 Light Green
          moderate: '#eab308',    // 101-200 Yellow
          poor: '#f97316',        // 201-300 Orange
          veryPoor: '#ef4444',    // 301-400 Red
          severe: '#881337',      // 401-500 Maroon
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 15px -3px rgba(59, 130, 246, 0.35)',
        'glow-red': '0 0 15px -3px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}
