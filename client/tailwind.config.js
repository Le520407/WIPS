/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          green: '#25D366',
          'light-green': '#DCF8C6',
          'bg': '#E5DDD5',
          'sidebar': '#FFFFFF',
          'header': '#EDEDED',
          'border': '#E9EDEF',
        }
      }
    },
  },
  plugins: [],
}
