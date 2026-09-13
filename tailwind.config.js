/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#18266f',
        'navy-2': '#111b58',
        blue: '#2b3fa0',
        ink: '#10183f',
        muted: '#69708d',
        paper: '#f6f7fb',
      },
    },
  },
  plugins: [],
}