// Tailwind setup
import { tw, setup } from 'twind';

setup({
  plugins: {
    snap: (parts) => {
      switch (parts[0]) {
        case 'start':
          return { 'scroll-snap-align': 'start' };
        case 'x':
          return { 'scroll-snap-type': 'x mandatory' };
        case 'mandatory':
          return { 'scroll-snap-type': 'mandatory' };
      }
    },
  },
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
});

export default tw;
