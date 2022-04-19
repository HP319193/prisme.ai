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
        accent: '#015dff',
        'gray-200': '#E5E5E5',
        'blue-200': '#F8FAFF',
        'graph-border': '#BFD7FF',
        'graph-background': '#E7EDF9',
        'graph-accent': '#015DFF',
        'prisme-darkblue': '#0A1D3B',
        'green-400': '#649D9F',
        'green-200': '#E7F6F6',
        'orange-500': '#FD6E6E',
      },
    },
  },
  plugins: [],
};
