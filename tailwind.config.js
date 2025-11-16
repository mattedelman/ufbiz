/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'uf-orange': '#FA4616',
        'uf-blue': '#0021A5',
      },
    },
  },
  plugins: [],
}



