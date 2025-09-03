/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx}", "./screens/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
    theme: {
      extend: {
        colors: {
          primary: '#FF6F61',
          secondary: '#333333',
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };
  