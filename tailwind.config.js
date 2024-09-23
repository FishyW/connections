/** @type {import('tailwindcss').Config} */

/*
-accent:#282D3F;
  --background: #161922;
  --primary:   #282d3f;
  --secondary: #5d657a;
  --text: #BCBDD0;
*/
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'accent': '#282d3f',
        'background': '#161922',
        'primary': '#282d3f',
        'secondary': '#5d657a',
        'text': '#bcbdd0'
    },
  },
  },
  plugins: [],
}

