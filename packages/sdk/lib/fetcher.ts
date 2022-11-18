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
  protected _apiKey: string | null = null;

  constructor(host: string) {
    this.host = host;
  }

  set apiKey(apiKey: string) {
    this._apiKey = apiKey;
  }

  protected async _fetch<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers || {});

    if (this.token && !headers.has('x-prismeai-token')) {
      headers.append('x-prismeai-token', this.token);
    }

    if (this._apiKey && !headers.has('x-prismeai-apikey')) {
      headers.append('x-prismeai-api-key', this._apiKey);
    }

    if (
      (!options.body || !(options.body instanceof FormData)) &&
      !headers.has('Content-Type')
    ) {
      headers.append('Content-Type', 'application/json');
    }

    headers.append('Access-Control-Allow-Origin', '*');

    const res = await global.fetch(`${this.host}${url}`, {
      ...options,
      headers,
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

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const response = (await res.json()) || {};
        Object.defineProperty(response, 'headers', {
          value: headersAsObject(res.headers),
          configurable: false,
          enumerable: false,
          writable: false,
        });
        return response as T;
      } catch (e) {
        return {} as T;
      }
    }

    const text = await res.text();

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }

    if (text.status == 'fulfilled') {
      return text.value as unknown as T;
    }

    throw new ApiError(
      {
        error: 'Failed to extract json and text from fetch response',
        message: '',
        details: { url: `${this.host}${url}` },
      },
      500
    );
  }

  async get<T = any>(url: string) {
    return this._fetch<T>(url, {
      method: 'GET',
    });
  }

  async post<T>(url: string, body?: Record<string, any>) {
    return this._fetch<T>(url, {
      method: 'POST',
      body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
    });
  }

  async put<T>(url: string, body: Record<string, any>) {
    return this._fetch<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(url: string, body: Record<string, any>) {
    return this._fetch<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(url: string) {
    return this._fetch<T>(url, {
      method: 'DELETE',
    });
  }
}

export default Fetcher;
