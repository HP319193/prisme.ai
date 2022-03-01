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
  hiddenLS.getItem = localStorage.__proto__.getItem.bind(localStorage);
  localStorage.__proto__.getItem = (k: string) => {
    if (k === 'auth-token') return null;
    return hiddenLS.getItem(k);
  };

  hiddenLS.setItem = localStorage.__proto__.setItem.bind(localStorage);
  localStorage.__proto__.setItem = (k: string, v: any) => {
    if (k === 'auth-token') return null;
    return hiddenLS.setItem(k, v);
  };

  hiddenLS.removeItem = localStorage.__proto__.removeItem.bind(localStorage);
  localStorage.__proto__.removeItem = (k: string) => {
    if (k === 'auth-token') return null;
    return hiddenLS.removeItem(k);
  };
}

export const Storage = {
  get: (k: string) => {
    if (IS_LOCAL_STORAGE_AVAILABLE) {
      const v = hiddenLS.getItem(k);
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
      return hiddenLS.setItem(k, value);
    }
    return Cookie.set(k, value);
  },
  remove: (k: string) => {
    if (IS_LOCAL_STORAGE_AVAILABLE) {
      return hiddenLS.removeItem(k);
    }
    Cookie.remove(k);
  },
};

export default Storage;
