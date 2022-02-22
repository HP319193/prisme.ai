import ApiError from './ApiError';
import HTTPError from './HTTPError';

const headersAsObject = (headers: Headers) =>
  Array.from(headers).reduce(
    (prev, [k, v]) => ({
      ...prev,
      [k]: v,
    }),
    {}
  );

export class Fetcher {
  public host: string;
  public token: string | null = null;

  constructor(host: string) {
    this.host = host;
  }

  private async _fetch(url: string, options: RequestInit = {}) {
    const headers: any = options.headers || {};
    if (this.token && !headers['x-prismeai-session-token']) {
      headers['x-prismeai-session-token'] = this.token;
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
