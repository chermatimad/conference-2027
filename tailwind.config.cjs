/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {primary: '#15254A', secondary: '#1A8140', accent: '#BE9238', lightBlue: '#84C3E4', bgLight: '#F4F7FA'},
      fontFamily: {cairo: ['Cairo', 'sans-serif'], poppins: ['Poppins', 'sans-serif']},
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {'background-size': '200% 200%', 'background-position': 'left center'},
          '50%': {'background-size': '200% 200%', 'background-position': 'right center'},
        },
        float: {'0%, 100%': {transform: 'translateY(0)'}, '50%': {transform: 'translateY(-15px)'}},
        marquee: {'0%': {transform: 'translateX(0)'}, '100%': {transform: 'translateX(-50%)'}},
      },
    },
  },
  plugins: [],
}
