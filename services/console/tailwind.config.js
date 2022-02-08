module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './views/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    borderRadius: {
      DEFAULT: '10px',
    },
    extend: {
      colors: {
        // Antdesign secondary text color
        gray: '#939CA6',
        'gray-200': '#E5E5E5',
        'blue-200': '#F8FAFF',
      },
    },
  },
  plugins: [],
};
