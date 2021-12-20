import ApiError from "./ApiError";
import Fetcher from "./fetcher";
import HTTPError from "./HTTPError";
import Storage from "../utils/Storage";

beforeEach(() => {
  Storage.remove("auth-token");
});
it("should fetch", async () => {
  const fetcher = new Fetcher("http/");
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: [["foo", "bar"]],
    json() {
      return undefined;
    },
  }));
  const o = await fetcher.get("url");
  expect(o.headers).toEqual({ foo: "bar" });
  expect(global.fetch).toHaveBeenCalledWith("http/url", {
    headers: {},
    method: "GET",
  });
});

it("should fetch with auth", async () => {
  const fetcher = new Fetcher("http/");
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: {},
    json() {
      return {};
    },
  }));
  fetcher.token = "token";
  await fetcher.get("url");
  expect(global.fetch).toHaveBeenCalledWith("http/url", {
    headers: {
      "x-prismeai-session-token": "token",
    },
    method: "GET",
  });
});

it("should fail to fetch", async () => {
  const fetcher = new Fetcher("http/");
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: false,
    statusText: JSON.stringify({
      error: "error",
      message: "message",
    }),
    status: 400,
  }));
  try {
    await fetcher.get("url");
  } catch (e) {
    expect(e).toBeInstanceOf(ApiError);
    if (e instanceof ApiError) {
      expect(e.error).toBe("error");
      expect(e.message).toBe("message");
    }
  }
  expect(global.fetch).toHaveBeenCalledWith("http/url", {
    headers: {},
    method: "GET",
  });
});

it("should fail to fetch with unformatted error", async () => {
  const fetcher = new Fetcher("http/");
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: false,
    statusText: "error",
    status: 400,
  }));
  try {
    await fetcher.get("url");
  } catch (e) {
    expect(e).toBeInstanceOf(HTTPError);
    if (e instanceof ApiError) {
      expect(e.message).toBe("error");
    }
  }
  expect(global.fetch).toHaveBeenCalledWith("http/url", {
    headers: {},
    method: "GET",
  });
});

it("should post", async () => {
  const fetcher = new Fetcher("http/");
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: {},
    json() {
      return {};
    },
  }));
  await fetcher.post("url");
  expect(global.fetch).toHaveBeenCalledWith("http/url", {
    headers: {},
    method: "POST",
  });
});

it("should post with body", async () => {
  const fetcher = new Fetcher("http/");
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: {},
    json() {
      return {};
    },
  }));
  await fetcher.post("url", {});
  expect(global.fetch).toHaveBeenCalledWith("http/url", {
    headers: {},
    method: "POST",
    body: "{}",
  });
});

it("should patch", async () => {
  const fetcher = new Fetcher("http/");
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: {},
    json() {
      return {};
    },
  }));
  await fetcher.patch("url", {});
  expect(global.fetch).toHaveBeenCalledWith("http/url", {
    headers: {},
    method: "PATCH",
    body: "{}",
  });
});

it("should delete", async () => {
  const fetcher = new Fetcher("http/");
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: {},
    json() {
      return {};
    },
  }));
  await fetcher.delete("url", "42");
  expect(global.fetch).toHaveBeenCalledWith("http/url", {
    headers: {},
    method: "DELETE",
    body: '{"id":"42"}',
  });
});

it("should delete token", () => {
  const fetcher = new Fetcher("http/");
  jest.spyOn(Storage, "remove");
  fetcher.token = null;
  expect(Storage.remove).toHaveBeenCalledWith("auth-token");
});
