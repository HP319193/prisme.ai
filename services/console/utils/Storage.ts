import Cookie from 'js-cookie';
import localStorage from './localStorage';
import sessionStorage from './sessionStorage';

function checkStorage(storage: Storage) {
  try {
    if (!storage) throw new Error();
    storage.setItem('__test', '1');
    storage.removeItem('__test');
    return true;
  } catch (e) {
    return false;
  }
}

if (checkStorage(localStorage!)) {
  // This prevents page devs from accessing the localStorage
  Object.defineProperty(window, 'localStorage', {
    value: sessionStorage,
    configurable: true,
  });
}
const ls = localStorage!;

export class StoragePolyfill {
  private storage: Storage | null = ls;

  constructor(storage?: Storage) {
    if (storage) {
      this.storage = storage;
    }
    if (this.storage && !checkStorage(this.storage)) {
      this.storage = null;
    }
  }

  get(k: string) {
    if (!this.storage) return Cookie.get(k);
    const v = this.storage.getItem(k);
    try {
      return JSON.parse(v || '');
    } catch (e) {
      return v;
    }
  }
  set(k: string, v: any) {
    const value = typeof v === 'object' ? JSON.stringify(v) : v;
    if (this.storage) {
      return this.storage.setItem(k, value);
    }
    return Cookie.set(k, value); // No sensitive data should be stored in this fallback Storage
  }
  remove(k: string) {
    if (this.storage) {
      return this.storage.removeItem(k);
    }
    Cookie.remove(k);
  }
}

export const SessionStorage = new StoragePolyfill(sessionStorage);
export default new StoragePolyfill();
