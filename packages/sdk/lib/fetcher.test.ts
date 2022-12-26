import ApiError from './ApiError';
import Fetcher from './fetcher';
import HTTPError from './HTTPError';

it('should fetch', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: new Headers([['foo', 'bar']]),
    text() {
      return '';
    },
    clone() {
      return { ...this };
    },
  }));
  const o = await fetcher.get('url');
  expect(global.fetch).toHaveBeenCalledWith('http/url', {
    headers: expect.any(Headers),
    method: 'GET',
  });
  const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
  expect(headers.get('Access-Control-Allow-Origin')).toBe('*');
  expect(headers.get('Content-Type')).toBe('application/json');
});

it('should fetch with auth', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: new Headers(),
    text() {
      return '';
    },
    clone() {
      return { ...this };
    },
  }));
  fetcher.token = 'token';
  await fetcher.get('url');
  expect(global.fetch).toHaveBeenCalledWith('http/url', {
    headers: expect.any(Headers),
    method: 'GET',
  });
  const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
  expect(headers.get('Access-Control-Allow-Origin')).toBe('*');
  expect(headers.get('x-prismeai-token')).toBe('token');
});

it('should fetch with api key', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: new Headers(),
    text() {
      return '';
    },
    clone() {
      return { ...this };
    },
  }));
  fetcher.token = 'token';
  fetcher.apiKey = 'api-key';
  await fetcher.get('url');
  expect(global.fetch).toHaveBeenCalledWith('http/url', {
    headers: expect.any(Headers),
    method: 'GET',
  });
  const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
  expect(headers.get('Access-Control-Allow-Origin')).toBe('*');
  expect(headers.get('x-prismeai-token')).toBe('token');
  expect(headers.get('x-prismeai-api-key')).toBe('api-key');
});

it('should fail to fetch', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: false,
    json: () => ({
      error: 'error',
      message: 'message',
    }),
    status: 400,
  }));
  try {
    await fetcher.get('url');
  } catch (e) {
    expect(e).toBeInstanceOf(ApiError);
    if (e instanceof ApiError) {
      expect(e.error).toBe('error');
      expect(e.message).toBe('message');
    }
  }
  expect(global.fetch).toHaveBeenCalledWith('http/url', {
    headers: expect.any(Headers),
    method: 'GET',
  });
});

it('should fail to fetch with unformatted error', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: false,
    statusText: 'error',
    status: 400,
  }));
  try {
    await fetcher.get('url');
  } catch (e) {
    expect(e).toBeInstanceOf(HTTPError);
    if (e instanceof ApiError) {
      expect(e.message).toBe('error');
    }
  }
  expect(global.fetch).toHaveBeenCalledWith('http/url', {
    headers: expect.any(Headers),
    method: 'GET',
  });
});

it('should post', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: new Headers([['content-type', 'application/json']]),
    json() {
      return {};
    },
    clone() {
      return { ...this };
    },
  }));
  await fetcher.post('url');
  expect(global.fetch).toHaveBeenCalledWith('http/url', {
    headers: expect.any(Headers),
    method: 'POST',
  });
});

it('should post with body', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: new Headers([['content-type', 'application/json']]),
    json() {
      return {};
    },
    clone() {
      return { ...this };
    },
  }));
  await fetcher.post('url', {});
  expect(global.fetch).toHaveBeenCalledWith('http/url', {
    headers: expect.any(Headers),
    method: 'POST',
    body: '{}',
  });
});

it('should put', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: new Headers([['content-type', 'application/json']]),
    json() {
      return {};
    },
    clone() {
      return { ...this };
    },
  }));
  await fetcher.put('url', {});
  expect(global.fetch).toHaveBeenCalledWith('http/url', {
    headers: expect.any(Headers),
    method: 'PUT',
    body: '{}',
  });
});

it('should patch', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: new Headers([['content-type', 'application/json']]),
    json() {
      return {};
    },
    clone() {
      return { ...this };
    },
  }));
  await fetcher.patch('url', {});
  expect(global.fetch).toHaveBeenCalledWith('http/url', {
    headers: expect.any(Headers),
    method: 'PATCH',
    body: '{}',
  });
});

it('should delete', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: new Headers([['content-type', 'application/json']]),
    json() {
      return {};
    },
    clone() {
      return { ...this };
    },
  }));
  await fetcher.delete('url');
  expect(global.fetch).toHaveBeenCalledWith('http/url', {
    headers: expect.any(Headers),
    method: 'DELETE',
  });
});

it('should use formData', async () => {
  const fetcher = new Fetcher('http/');
  // @ts-ignore
  global.fetch = jest.fn(() => ({
    ok: true,
    headers: new Headers([['content-type', 'application/json']]),
    json() {
      return {};
    },
    clone() {
      return { ...this };
    },
  }));
  const formData = new FormData();
  await fetcher.post('url', formData);
  const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
  expect(headers.has('Content-Type')).toBe(false);
});
