/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        annasetu: {
          cream: '#f7f1e3',
          forest: '#1f4d36',
          'forest-hover': '#163827',
          green: '#4f9d3a',
          'green-light': '#eaf5e8',
          charcoal: '#23262b',
          'charcoal-muted': '#5c6068',
          urgency: '#e0662b',
          'urgency-light': '#fdf0ea',
          border: '#e5dec9',
          'dark-bg': '#14171a',
          'dark-surface': '#1c2024',
          'dark-border': '#2d3239',
        },
      },
      fontFamily: {
        heading: ['var(--font-fraunces)', 'Fraunces', 'serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
