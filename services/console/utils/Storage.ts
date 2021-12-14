import Cookie from "js-cookie";

const checkLocalStorage = () => {
  try {
    localStorage.setItem("__test", "1");
    localStorage.removeItem("__test");
    return true;
  } catch (e) {
    return false;
  }
};

const IS_LOCAL_STORAGE_AVAILABLE = checkLocalStorage();

export const Storage = {
  get: (k: string) => {
    if (IS_LOCAL_STORAGE_AVAILABLE) {
      const v = localStorage.getItem(k);
      try {
        return JSON.parse(v || "");
      } catch (e) {
        return v;
      }
    }

    return Cookie.get(k);
  },
  set: (k: string, v: any) => {
    if (IS_LOCAL_STORAGE_AVAILABLE) {
      return localStorage.setItem(k, JSON.stringify(v));
    }
    return Cookie.set(k, JSON.stringify(v));
  },
  remove: (k: string) => {
    if (IS_LOCAL_STORAGE_AVAILABLE) {
      return localStorage.removeItem(k);
    }
    Cookie.remove(k);
  },
};
