import Storage from '../../utils/Storage';

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

  // @ts-ignore
  window.Prisme = window.Prisme || {};
  // @ts-ignore
  window.Prisme.ai = window.Prisme.ai || {};
  // @ts-ignore
  window.Prisme.ai.colorScheme = {
    get: getColorScheme,
    set: setColorScheme,
    toggle: toggleColorScheme,
  };
  return null;
};

export default ColorSchemeManager;
