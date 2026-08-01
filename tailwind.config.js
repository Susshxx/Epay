export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        didot: ['"GFS Didot"', 'serif'],
        jeju: ['"Jeju Myeongjo"', 'serif'],
      },
      colors: {
        canvas: '#E1E1D5',
        mint: '#5DB7A1',
        gold: '#FCD53F',
        forest: '#103E28',
      },
    },
  },
  plugins: [],
};
