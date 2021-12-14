import { Storage } from "../utils/Storage";
import ApiError from "./ApiError";
import HTTPError from "./HTTPError";

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
      Storage.set("auth-token", v);
    } else {
      Storage.remove("auth-token");
    }
  }

  private get _token() {
    return Storage.get("auth-token");
  }

  constructor(host: string) {
    this.host = host;
  }

  async _fetch(url: string, options: RequestInit = {}) {
    const headers: any = options.headers || {};
    headers["x-prismeai-session-token"] =
      headers["x-prismeai-session-token"] || this._token;
    const res = await fetch(`${this.host}${url}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      try {
        throw new ApiError(JSON.parse(res.statusText), res.status);
      } catch (e) {}
      throw new HTTPError(res.statusText, res.status);
    }

    const response = (await res.json()) || {};
    Object.defineProperty(response, "headers", {
      value: headersAsObject(res.headers),
      configurable: false,
      enumerable: false,
      writable: false,
    });
    return response;
  }
  async get(url: string) {
    return this._fetch(url, {
      method: "get",
    });
  }
  async post(url: string, body: Record<string, any>) {
    return this._fetch(url, {
      method: "post",
      body: JSON.stringify(body),
    });
  }
  async patch(url: string, body: Record<string, any>) {
    return this._fetch(url, {
      method: "patch",
      body: JSON.stringify(body),
    });
  }
  async delete(url: string, id: string) {
    return this._fetch(url, {
      method: "delete",
      body: JSON.stringify({ id }),
    });
  }
}

export default Fetcher;
