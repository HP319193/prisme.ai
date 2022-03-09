import Cookie from 'js-cookie';
import localStorage from './localStorage';

const checkLocalStorage = () => {
  try {
    localStorage.setItem('__test', '1');
    localStorage.removeItem('__test');
    return true;
  } catch (e) {
    return false;
  }
};

const IS_LOCAL_STORAGE_AVAILABLE = checkLocalStorage();

const hiddenLS: {
  getItem: typeof localStorage.getItem;
  setItem: typeof localStorage.setItem;
  removeItem: typeof localStorage.removeItem;
} = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {},
};
if (IS_LOCAL_STORAGE_AVAILABLE) {
  Object.defineProperty(window, 'localStorage', {
    value: sessionStorage,
    configurable: true,
  });
}

export const Storage = {
  get: (k: string) => {
    if (IS_LOCAL_STORAGE_AVAILABLE) {
      const v = localStorage.getItem(k);
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
      return localStorage.setItem(k, value);
    }
    return Cookie.set(k, value);
  },
  remove: (k: string) => {
    if (IS_LOCAL_STORAGE_AVAILABLE) {
      return localStorage.removeItem(k);
    }
    Cookie.remove(k);
  },
};

export default Storage;
