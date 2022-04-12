module.exports = {
  content: ['./lib/**/*.{js,ts,jsx,tsx}'],
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
  safelist: [
    '!text-blue-500'
  ],
  plugins: [],
};
