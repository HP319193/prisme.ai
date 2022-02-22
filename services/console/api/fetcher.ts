import { Storage } from '../utils/Storage';
import ApiError from './ApiError';
import HTTPError from './HTTPError';

const TOKEN_KEY = 'prisme-auth-token';
const headersAsObject = (headers: Headers) =>
  Array.from(headers).reduce(
    (prev, [k, v]) => ({
      ...prev,
      [k]: v,
    }),
    {}
  );

export class Fetcher {
  private host: string;

  set token(v: string | null) {
    if (v) {
      Storage.set(TOKEN_KEY, v);
    } else {
      Storage.remove(TOKEN_KEY);
    }
  }

  private get _token() {
    return Storage.get(TOKEN_KEY);
  }

  constructor(host: string) {
    this.host = host;
  }

  private async _fetch(url: string, options: RequestInit = {}) {
    const headers: any = options.headers || {};
    if (this._token && !headers['x-prismeai-session-token']) {
      headers['x-prismeai-session-token'] = this._token;
    }
    const res = await global.fetch(`${this.host}${url}`, {
      ...options,
      headers: {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      let error;
      try {
        error = new ApiError(await res.json(), res.status);
      } catch (e) {
        error = new HTTPError(res.statusText, res.status);
      }
      throw error;
    }

    const response = (await res.json()) || {};
    Object.defineProperty(response, 'headers', {
      value: headersAsObject(res.headers),
      configurable: false,
      enumerable: false,
      writable: false,
    });
    return response;
  }

  async get<T = any>(url: string): Promise<T> {
    return this._fetch(url, {
      method: 'GET',
    });
  }

  async post(url: string, body?: Record<string, any>) {
    return this._fetch(url, {
      method: 'POST',
      body: body && JSON.stringify(body),
    });
  }

  async patch(url: string, body: Record<string, any>) {
    return this._fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete(url: string) {
    return this._fetch(url, {
      method: 'DELETE',
    });
  }
}

export default Fetcher;
