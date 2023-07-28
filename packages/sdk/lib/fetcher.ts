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
  public legacyToken: string | null = null;
  public overwriteClientId?: string;
  private clientIdHeader?: string;
  protected _apiKey: string | null = null;
  public language: string | undefined;
  public lastReceivedHeaders?: Record<string, any>;

  constructor(host: string, clientIdHeader?: string) {
    this.host = host;
    this.clientIdHeader = clientIdHeader;
  }

  set apiKey(apiKey: string) {
    this._apiKey = apiKey;
  }

  prepareRequest(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});

    if (this.token && !headers.has('Authorization')) {
      headers.append('Authorization', `Bearer ${this.token}`);
    } else if (this.legacyToken && !headers.has('Authorization')) {
      headers.append('x-prismeai-token', this.legacyToken);
    }

    if (this._apiKey && !headers.has('x-prismeai-apikey')) {
      headers.append('x-prismeai-api-key', this._apiKey);
    }

    if (this.language) {
      headers.append('accept-language', this.language);
    }

    if (options.body instanceof URLSearchParams) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded');
    }

    if (
      (!options.body || !(options.body instanceof FormData)) &&
      !headers.has('Content-Type')
    ) {
      headers.append('Content-Type', 'application/json');
    }

    const fullUrl =
      url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `${this.host}${url}`;
    return global.fetch(fullUrl, {
      credentials: 'include',
      ...options,
      headers,
    });
  }

  protected async _fetch<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await this.prepareRequest(url, options);
    if (options.redirect === 'manual' && res.status === 0) {
      return { redirected: true } as T;
    }

    this.lastReceivedHeaders = headersAsObject(res.headers);
    if (this.clientIdHeader && this.lastReceivedHeaders[this.clientIdHeader]) {
      this.overwriteClientId = this.lastReceivedHeaders[this.clientIdHeader];
    }
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
  }

  async get<T = any>(url: string) {
    return this._fetch<T>(url, {
      method: 'GET',
    });
  }

  async post<T>(url: string, body?: Record<string, any>, opts?: RequestInit) {
    return this._fetch<T>(url, {
      method: 'POST',
      body:
        body &&
        !(body instanceof FormData) &&
        !(body instanceof URLSearchParams)
          ? JSON.stringify(body)
          : body,
      ...opts,
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
