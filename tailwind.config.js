/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "selected-bg": "#DCECFC",
        "selected-text": "#000",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        "::selection": {
          backgroundColor: "#DCECFC",
          color: "#000",
        },
      });
    },
  ],
};
