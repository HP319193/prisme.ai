module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './views/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: [
        'Montserrat',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'Fira Sans',
        'Droid Sans',
        'Helvetica Neue',
        'sans-serif',
      ],
    },
    borderRadius: {
      DEFAULT: '10px',
    },
    extend: {
      fontSize: {
        'products-sm': '12px',
        'products-base': '14px',
        'products-lg': '16px',
        'products-xl': '24px',
      },
      colors: {
        // v2
        'layout-surface': 'var(--layout-surface)',
        'main-surface': 'var(--main-surface)',
        'main-element': 'var(--main-element)',
        'main-text': 'var(--main-text)',
        'main-link': 'var(--main-link)',
        primary: 'var(--primary)',
        'primary-contrast': 'var(--primary-contrast)',
        button: 'var(--button)',

        // v1
        // Antdesign secondary text color
        gray: 'var(--gray-color)',
        'light-gray': 'var(--light-gray-color)',
        accent: 'var(--accent-color)',
        'light-accent': 'var(--light-accent-color)',
        'ultra-light-accent': 'var(--ultra-light-accent-color)',
        'dark-accent': 'var(--dark-accent-color)',
        link: 'var(--link-color)',
        surface: 'var(--surface-color)',
        base: 'var(--base-color)',
        warning: 'var(--warning-color)',
        error: 'var(--error-color)',
        info: '#E6EFFF',

        'pr-orange': '#FF9261',
        'pr-grey': '#939CA6',
        'gray-200': '#E5E5E5',
        'gray-300': '#C4C4C4',
        'gray-500': '#F2F4F9',
        'blue-200': '#F8FAFF',
        'graph-border': '#ced2d8',
        'graph-background': '#E7EDF9',
        'graph-accent': '#015DFF',
        'graph-selected-accent': '#1251c4',
        'prisme-darkblue': '#0A1D3B',
        'green-400': '#649D9F',
        'green-100': '#4c7072',
        'green-200': '#E7F6F6',
        'orange-500': '#FD6E6E',
      },
      animation: {
        'add-product': 'bounce .2s',
      },
    },
  },
  plugins: [],
};
