import Cookie from 'js-cookie';
import localStorage from './localStorage';

const checkLocalStorage = () => {
  try {
    if (!localStorage) throw new Error();
    localStorage.setItem('__test', '1');
    localStorage.removeItem('__test');
    return true;
  } catch (e) {
    return false;
  }
};

const IS_LOCAL_STORAGE_AVAILABLE = checkLocalStorage();

if (IS_LOCAL_STORAGE_AVAILABLE) {
  Object.defineProperty(window, 'localStorage', {
    value: sessionStorage,
    configurable: true,
  });
}
const ls = localStorage!;

export const Storage = {
  get: (k: string) => {
    if (IS_LOCAL_STORAGE_AVAILABLE) {
      const v = ls.getItem(k);
      try {
        return JSON.parse(v || '');
      } catch (e) {
        return v;
      }
    }

    return Cookie.get(k);
  },
  set: (k: string, v: any) => {
    const value = typeof v === 'object' ? JSON.stringify(v) : v;
    if (IS_LOCAL_STORAGE_AVAILABLE) {
      return ls.setItem(k, value);
    }
    return Cookie.set(k, value);
  },
  remove: (k: string) => {
    if (IS_LOCAL_STORAGE_AVAILABLE) {
      return ls.removeItem(k);
    }
    Cookie.remove(k);
  },
};

export default Storage;
