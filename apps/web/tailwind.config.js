/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        annasetu: {
          cream: '#FDFBF7',
          'cream-alt': '#F5F0E8',
          'cream-border': '#E8E1D5',
          forest: '#143D2B',
          'forest-dark': '#0D291D',
          'forest-light': '#1E523A',
          green: '#2D6A4F',
          'green-light': '#40916C',
          'green-mint': '#E8F5E9',
          charcoal: '#1A1C1E',
          muted: '#5F6368',
          urgency: '#D9480F',
          'urgency-bg': '#FFF4E6',
          gold: '#D4AF37',
          'gold-bg': '#FEF9E7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Merriweather', 'serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(20, 61, 43, 0.05)',
        'card': '0 4px 20px -2px rgba(20, 61, 43, 0.08)',
        'elevated': '0 12px 32px -4px rgba(20, 61, 43, 0.12)',
      }
    },
  },
  plugins: [],
}
