import api, { Api } from './api';

it('should export an instance', () => {
  expect(api).toBeInstanceOf(Api);
});

it('should call /me', () => {
  const api = new Api('/fake/');
  api.get = jest.fn(
    async () =>
      ({
        sessionId: 'session',
      } as any)
  );
  api.me();
  expect(api.get).toHaveBeenCalledWith('/me');
});

it('should call /signin', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.signin('user@fake.com', 'password');
  expect(api.post).toHaveBeenCalledWith('/login', {
    email: 'user@fake.com',
    password: 'password',
  });
});

it('should call /signup', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.signup('user@fake.com', 'password', 'firstname', 'lastname');
  expect(api.post).toHaveBeenCalledWith('/signup', {
    email: 'user@fake.com',
    password: 'password',
    firstName: 'firstname',
    lastName: 'lastname',
  });
});

it('should call /signout', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.signout();
  expect(api.post).toHaveBeenCalledWith('/logout');
  expect(api.token).toBeNull();
});

it('should call get /workspaces', () => {
  const api = new Api('/fake/');
  api.get = jest.fn();
  api.getWorkspaces();
  expect(api.get).toHaveBeenCalledWith('/workspaces?limit=300');
});

it('should call get /workspaces/42', () => {
  const api = new Api('/fake/');
  api.get = jest.fn();
  api.getWorkspace('42');
  expect(api.get).toHaveBeenCalledWith('/workspaces/42');
});

it('should call post /workspaces', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.createWorkspace('foo');
  expect(api.post).toHaveBeenCalledWith('/workspaces', {
    name: 'foo',
  });
});

it('should call patch /workspaces/42', async () => {
  const api = new Api('/fake/');
  api.patch = jest.fn();
  await api.updateWorkspace({
    id: '42',
    name: 'foo',
    automations: {},
    createdAt: '',
    updatedAt: '',
  });
  expect(api.patch).toHaveBeenCalledWith('/workspaces/42', {
    id: '42',
    name: 'foo',
    automations: {},
    createdAt: '',
    updatedAt: '',
  });
});

it('should call post /workspaces/42/automations', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.createAutomation(
    {
      id: '42',
      name: 'foo',
      automations: {},
      createdAt: '',
      updatedAt: '',
    },
    {
      name: 'foo',
      do: [],
    }
  );
  expect(api.post).toHaveBeenCalledWith('/workspaces/42/automations', {
    name: 'foo',
    do: [],
  });
});

it('should call patch /workspaces/42/automations', async () => {
  const api = new Api('/fake/');
  api.patch = jest.fn();
  await api.updateAutomation(
    {
      id: '42',
      name: 'foo',
      automations: {},
      createdAt: '',
      updatedAt: '',
    },
    '42-1',
    {
      name: 'foo',
      do: [],
    }
  );
  expect(api.patch).toHaveBeenCalledWith('/workspaces/42/automations/42-1', {
    name: 'foo',
    do: [],
  });
});

it('should call delete /workspaces/42/automations/42-1', () => {
  const api = new Api('/fake/');
  api.delete = jest.fn();
  api.deleteAutomation(
    {
      id: '42',
      name: 'foo',
      automations: {},
      createdAt: '',
      updatedAt: '',
    },
    '42-1'
  );
  expect(api.delete).toHaveBeenCalledWith('/workspaces/42/automations/42-1');
});

it('should call get /workspaces/42/events', async () => {
  const api = new Api('/fake/');
  api.get = jest.fn(
    async (): Promise<any> => ({
      result: {
        events: [
          {
            id: '1',
            createdAt: '2021-01-01',
          },
        ],
      },
    })
  );
  expect(await api.getEvents('42')).toEqual([
    {
      id: '1',
      createdAt: new Date('2021-01-01'),
    },
  ]);
});

it('should replace all images data', async () => {
  const api = new Api('/fake/');
  api.uploadFiles = jest.fn(async () => [
    { url: 'http://image1.jpg' } as any,
    { url: 'http://image2.jpg' } as any,
    { url: 'http://image3.jpg' } as any,
    { url: 'http://image4.jpg' } as any,
    { url: 'http://image5.jpg' } as any,
  ]);
  const original = {
    foo: 'data:image/jpeg;base64…',
    bar: {
      pic: 'data:image/jpeg;base64…',
      pics: [
        'data:image/jpeg;base64…',
        'data:image/jpeg;base64…',
        'data:image/jpeg;base64…',
      ],
      nopics: 'http://alreadyUpImage.jpg',
    },
    anythingElse: 42,
  };
  expect(await api.replaceAllImagesData(original, '42')).toEqual({
    foo: 'http://image1.jpg',
    bar: {
      pic: 'http://image2.jpg',
      pics: ['http://image3.jpg', 'http://image4.jpg', 'http://image5.jpg'],
      nopics: 'http://alreadyUpImage.jpg',
    },
    anythingElse: 42,
  });
  expect(api.uploadFiles).toHaveBeenCalledWith(
    [
      'data:image/jpeg;base64…',
      'data:image/jpeg;base64…',
      'data:image/jpeg;base64…',
      'data:image/jpeg;base64…',
      'data:image/jpeg;base64…',
    ],
    '42'
  );
  expect(api.uploadFiles).toHaveBeenCalledTimes(1);
});

it('should upload file', async () => {
  const api = new Api('/fake/');
  // @ts-ignore
  api._fetch = jest.fn(() => [{}]);
  await api.uploadFiles(
    'data:image/jpeg;filename:foo.jpg;base64,abcdefg',
    '42'
  );
  // @ts-ignore
  expect(api._fetch).toHaveBeenCalledWith('/workspaces/42/files', {
    method: 'POST',
    body: expect.any(FormData),
  });
  const { body }: { body: FormData } =
    // @ts-ignore
    api._fetch.mock.calls[0][1];
  expect(body.getAll('file').length).toBe(1);
  expect((body.getAll('file')[0] as File).name).toBe('foo.jpg');
});

it('should generate api key', async () => {
  const api = new Api('/fake/');
  // @ts-ignore
  api._fetch = jest.fn(() => ({
    apiKey: 'api-key',
  }));
  const apiKey = await api.generateApiKey('42', ['event1', 'event2']);
  expect(apiKey).toBe('api-key');
  // @ts-ignore
  expect(api._fetch).toHaveBeenCalledWith('/workspaces/42/apiKeys', {
    method: 'POST',
    body: JSON.stringify({
      rules: {
        events: {
          types: ['event1', 'event2'],
          filters: {
            'source.sessionId': '${user.sessionId}',
          },
        },
      },
    }),
  });
});

it('should update api key', async () => {
  const api = new Api('/fake/');
  // @ts-ignore
  api._fetch = jest.fn(() => ({
    apiKey: 'api-key',
  }));
  const apiKey = await api.updateApiKey('42', 'api-key', [
    'event1',
    'event2',
    'event3',
  ]);
  expect(apiKey).toBe('api-key');
  // @ts-ignore
  expect(api._fetch).toHaveBeenCalledWith('/workspaces/42/apiKeys/api-key', {
    method: 'PUT',
    body: JSON.stringify({
      rules: {
        events: {
          types: ['event1', 'event2', 'event3'],
          filters: {
            'source.sessionId': '${user.sessionId}',
          },
        },
      },
    }),
  });
});
