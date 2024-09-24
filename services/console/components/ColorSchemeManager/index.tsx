import Storage from '../../utils/Storage';

declare global {
  interface Window {
    Prisme: {
      ai: {
        colorScheme: {
          get: () => 'dark' | 'light';
          set: (colorScheme: 'dark' | 'light') => void;
          toggle: () => void;
        };
      };
    };
  }
}

export function getColorScheme() {
  return (
    (document.documentElement.dataset.colorScheme as 'dark' | 'light') ||
    Storage.get('color-scheme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light')
  );
}

export function setColorScheme(scheme: 'dark' | 'light', save: boolean = true) {
  if (save) {
    Storage.set('color-scheme', scheme);
  }
  document.documentElement.setAttribute('data-color-scheme', scheme);
}

export function toggleColorScheme() {
  const next = getColorScheme() === 'dark' ? 'light' : 'dark';
  setColorScheme(next);
}

export const ColorSchemeManager = () => {
  if (typeof window === 'undefined') return null;

  setColorScheme(getColorScheme(), false);

  window.Prisme = window.Prisme || {};
  window.Prisme.ai = window.Prisme.ai || {};
  window.Prisme.ai.colorScheme = {
    get: getColorScheme,
    set: setColorScheme,
    toggle: toggleColorScheme,
  };
  return null;
};

export default ColorSchemeManager;
