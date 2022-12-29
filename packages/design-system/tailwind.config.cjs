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
        accent: '#015dff',
        'pr-orange': '#FF9261',
        'pr-grey': '#939CA6',
        'gray-200': '#E5E5E5',
        'gray-500': '#F2F4F9',
        'blue-200': '#F8FAFF',
        'graph-border': '#ced2d8',
        'graph-background': '#E7EDF9',
        'graph-accent': '#015DFF',
        'light-accent': '#80A4FF',
        'prisme-darkblue': '#0A1D3B',
        'green-400': '#649D9F',
        'green-200': '#E7F6F6',
        'orange-500': '#FD6E6E',
      },
    },
  },
  plugins: [],
};
