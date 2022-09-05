// Tailwind setup
import { setup, tw } from 'twind';

setup({
  plugins: {
    basis: (parts) => ({
      'flex-basis': '150rem',
    }),
    snap: (parts) => {
      switch (parts[0]) {
        case 'start':
          return { 'scroll-snap-align': 'start' };
        case 'x':
          return { 'scroll-snap-type': 'x mandatory' };
        case 'mandatory':
          return { 'scroll-snap-type': 'mandatory' };
        case 'both':
          return { 'scroll-snap-type': 'both mandatory' };
      }
    },
  },
  theme: {
    borderRadius: {
      DEFAULT: '10px',
    },
    extend: {
      flex: {
        card: '0 0 15rem',
      },
      colors: {
        // Antdesign secondary text color
        gray: '#939CA6',
        accent: '#015dff',
        'pr-orange': '#FF9261',
        'pr-grey': '#939CA6',
        'gray-200': '#E5E5E5',
        'blue-200': '#F8FAFF',
        'graph-border': '#ced2d8',
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
