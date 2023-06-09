import api, { Api } from './api';
import ApiError from './ApiError';
import UsersEndpoint from './endpoints/users';
import WorkspacesEndpoint from './endpoints/workspaces';
import WorkspacesVersionsEndpoint from './endpoints/workspacesVersions';

jest.mock('./events', () => {
  class Events {
    static mockedConstructor = jest.fn();
    static mockedClose = jest.fn();
    constructor({ api, ...args }: any) {
      // @ts-ignore
      this.api = api;
      Events.mockedConstructor({ api, ...args });
    }

    once = jest.fn((event: string, cb: Function) => {
      // @ts-ignore
      const shouldFail = this.api._shouldFail;
      if (!shouldFail && event === 'connect') cb();
      if (shouldFail && event !== 'connect') cb();
      return () => null;
    });
    close = Events.mockedClose;
  }
  return { Events };
});

it('should export an instance', () => {
  expect(api).toBeInstanceOf(Api);
});

it('should call /me', async () => {
  const api = new Api('/fake/');
  api.get = jest.fn(
    async () =>
      ({
        sessionId: 'session',
      } as any)
  );
  const me = await api.me();
  expect(api.get).toHaveBeenCalledWith('/me');
  expect(api.user).toBe(me);
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

it('should call /login/anonymous', async () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  const user = await api.createAnonymousSession();
  expect(api.post).toHaveBeenCalledWith('/login/anonymous');
  expect(api.user).toBe(user);
});

it('should call /signup', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.signup('user@fake.com', 'password', 'firstname', 'lastname', 'fr');
  expect(api.post).toHaveBeenCalledWith('/signup', {
    email: 'user@fake.com',
    password: 'password',
    firstName: 'firstname',
    lastName: 'lastname',
    language: 'fr',
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
  expect(api.get).toHaveBeenCalledWith('/workspaces?limit=600');
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

it('should call delete /workspaces/42', async () => {
  const api = new Api('/fake/');
  api.delete = jest.fn();
  await api.deleteWorkspace('42');
  expect(api.delete).toHaveBeenCalledWith('/workspaces/42');
});

it('should call post /workspaces/42/automations', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.createAutomation('42', {
    name: 'foo',
    do: [],
  });
  expect(api.post).toHaveBeenCalledWith('/workspaces/42/automations', {
    name: 'foo',
    do: [],
  });
});

it('should call patch /workspaces/42/automations', async () => {
  const api = new Api('/fake/');
  api.patch = jest.fn();
  await api.updateAutomation('42', '42-1', {
    name: 'foo',
    do: [],
  });
  expect(api.patch).toHaveBeenCalledWith('/workspaces/42/automations/42-1', {
    name: 'foo',
    do: [],
  });
});

it('should call delete /workspaces/42/automations/42-1', () => {
  const api = new Api('/fake/');
  api.delete = jest.fn();
  api.deleteAutomation('42', '42-1');
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
  api.post = jest.fn((): any => ({
    apiKey: 'api-key',
  }));
  const apiKey = await api.generateApiKey('42', ['event1', 'event2']);
  expect(apiKey).toBe('api-key');
  expect(api.post).toHaveBeenCalledWith('/workspaces/42/apiKeys', {
    rules: {
      events: {
        types: ['event1', 'event2'],
        filters: {
          'source.sessionId': '${user.sessionId}',
        },
      },
      uploads: undefined,
    },
  });
  (api.post as jest.Mock).mockClear();

  await api.generateApiKey('42', ['event1', 'event2'], ['images/*']);
  expect(api.post).toHaveBeenCalledWith('/workspaces/42/apiKeys', {
    rules: {
      events: {
        types: ['event1', 'event2'],
        filters: {
          'source.sessionId': '${user.sessionId}',
        },
      },
      uploads: {
        mimetypes: ['images/*'],
      },
    },
  });
});

it('should update api key', async () => {
  const api = new Api('/fake/');
  api.put = jest.fn((): any => ({
    apiKey: 'api-key',
  }));
  const apiKey = await api.updateApiKey('42', 'api-key', [
    'event1',
    'event2',
    'event3',
  ]);
  expect(apiKey).toBe('api-key');
  expect(api.put).toHaveBeenCalledWith('/workspaces/42/apiKeys/api-key', {
    rules: {
      events: {
        types: ['event1', 'event2', 'event3'],
        filters: {
          'source.sessionId': '${user.sessionId}',
        },
        uploads: undefined,
      },
    },
  });

  (api.put as jest.Mock).mockClear();

  await api.updateApiKey('42', 'api-key', ['event1', 'event2'], ['images/*']);
  expect(api.put).toHaveBeenCalledWith('/workspaces/42/apiKeys/api-key', {
    rules: {
      events: {
        types: ['event1', 'event2'],
        filters: {
          'source.sessionId': '${user.sessionId}',
        },
      },
      uploads: {
        mimetypes: ['images/*'],
      },
    },
  });
});

it('should send validation mail', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.sendValidationMail('email', 'fr');
  expect(api.post).toHaveBeenCalledWith('/user/validate', {
    email: 'email',
    language: 'fr',
  });
});

it('should validate mail', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.validateMail('token');
  expect(api.post).toHaveBeenCalledWith('/user/validate', {
    token: 'token',
  });
});

it('should send password reset mail', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.sendPasswordResetMail('email', 'fr');
  expect(api.post).toHaveBeenCalledWith('/user/password', {
    email: 'email',
    language: 'fr',
  });
});

it('should reset password', () => {
  const api = new Api('/fake/');
  api.post = jest.fn();
  api.passwordReset('token', 'azerty');
  expect(api.post).toHaveBeenCalledWith('/user/password', {
    token: 'token',
    password: 'azerty',
  });
});

it('should get pages', async () => {
  const api = new Api('/fake/');
  api.get = jest.fn((): any => [
    {
      id: '123',
      createdAt: 'must be removed',
      createdBy: 'must be removed',
      updatedAt: 'must be removed',
      updatedBy: 'must be removed',
    },
  ]);
  const pages = await api.getPages('42');
  expect(api.get).toHaveBeenCalledWith('/workspaces/42/pages');
  expect(pages).toEqual([{ id: '123' }]);

  api.get = jest.fn((): any => {
    throw new Error();
  });
  const empty = await api.getPages('42');
  expect(empty).toEqual([]);
});

it('should get page', () => {
  const api = new Api('/fake/');
  api.get = jest.fn((): any => ({}));
  api.getPage('42', '123');
  expect(api.get).toHaveBeenCalledWith('/workspaces/42/pages/123');
});

it('should get page by slug', () => {
  const api = new Api('/fake/');
  api.get = jest.fn((): any => ({}));
  api.getPageBySlug('42', '123');
  expect(api.get).toHaveBeenCalledWith('/pages/42/123');
});

it('should create page', () => {
  const api = new Api('/fake/');
  api.post = jest.fn((): any => ({}));
  api.createPage('42', {} as Prismeai.Page);
  expect(api.post).toHaveBeenCalledWith(`/workspaces/42/pages`, {});
});

it('should update page', async () => {
  const api = new Api('/fake/');
  api.patch = jest.fn((): any => ({ slug: 'my-page' }));
  await api.updatePage('42', { id: '123', slug: 'my-page' } as Prismeai.Page);
  expect(api.patch).toHaveBeenCalledWith(`/workspaces/42/pages/my-page`, {
    id: '123',
    slug: 'my-page',
  });
});

it('should delete page', () => {
  const api = new Api('/fake/');
  api.delete = jest.fn((): any => ({ id: '123' }));
  api.deletePage('42', '123');
  expect(api.delete).toHaveBeenCalledWith('/workspaces/42/pages/123');
});

it('should stream events', async () => {
  const api = new Api('/fake/');

  const events = await api.streamEvents('42');
  expect((events.constructor as any).mockedConstructor).toHaveBeenCalledWith({
    workspaceId: '42',
    token: '',
    apiKey: undefined,
    apiHost: '/fake/',
    filters: undefined,
    api,
  });
  expect(events.once).toHaveBeenCalled();
  (events.constructor as any).mockedConstructor.mockClear();

  const events2 = await api.streamEvents('42', { 'source.sessionId': true });
  expect((events2.constructor as any).mockedConstructor).toHaveBeenCalledWith({
    workspaceId: '42',
    token: '',
    apiKey: undefined,
    apiHost: '/fake/',
    filters: {},
    api,
  });
  expect(events2.once).toHaveBeenCalled();

  // @ts-ignore
  api.sessionId = 'session id';
  // @ts-ignore
  api._apiKey = 'api key';
  const events3 = await api.streamEvents('42', { 'source.sessionId': true });
  expect((events2.constructor as any).mockedConstructor).toHaveBeenCalledWith({
    workspaceId: '42',
    token: '',
    apiKey: 'api key',
    apiHost: '/fake/',
    filters: {
      'source.sessionId': 'session id',
    },
    api,
  });
  expect(events3.once).toHaveBeenCalled();

  // @ts-ignore
  api._shouldFail = true;
  try {
    await api.streamEvents('42');
  } catch (e) {}
  expect((events3.constructor as any).mockedConstructor).toHaveBeenCalledWith({
    workspaceId: '42',
    token: '',
    apiKey: 'api key',
    apiHost: '/fake/',
    filters: undefined,
    api,
  });
  expect(events3.close).toHaveBeenCalled();
});

it('should get events', async () => {
  const api = new Api('/fake/');
  api.get = jest.fn((): any => ({
    result: { events: [{ createdAt: '2022-01-01', id: '123' }] },
  }));
  api.getEvents('42');
  expect(api.get).toHaveBeenCalledWith('/workspaces/42/events');

  const events = await api.getEvents('42', { foo: 'bar' });
  expect(api.get).toHaveBeenCalledWith('/workspaces/42/events?foo=bar');
  expect(events).toEqual([{ id: '123', createdAt: new Date('2022-01-01') }]);

  api.get = jest.fn((): any => {
    throw new Error();
  });
  const empty = await api.getEvents('42', { foo: 'bar' });
  expect(empty).toEqual([]);
});

it('should post events', async () => {
  const api = new Api('/fake/');
  api.post = jest.fn((): any => {});
  const res = await api.postEvents('42', [
    {
      type: 'foo',
      payload: {},
    },
  ]);
  expect(api.post).toHaveBeenCalledWith('/workspaces/42/events', {
    events: [
      {
        type: 'foo',
        payload: {},
      },
    ],
  });
  expect(res).toBe(true);

  api.post = jest.fn((): any => {
    throw new Error();
  });
  const res2 = await api.postEvents('42', [
    {
      type: 'foo',
      payload: {},
    },
  ]);
  expect(res2).toBe(false);
});

describe('permissions', () => {
  const api = new Api('/fake/');
  api.get = jest.fn((path: string): any => {
    if (path === '/pages/id/permissions') {
      return {
        result: [],
      };
    }
  });
  api.post = jest.fn((path: string, body: any): any => {
    if (path === '/pages/id/permissions') {
      return body;
    }
  });
  api.findContacts = jest.fn(({ email }): any => {
    if (email === 'foo@bar.com')
      return {
        contacts: [
          {
            id: '1234',
          },
        ],
      };
    return { contacts: [] };
  });
  api.getPermissions('pages', 'id');

  it('should get permissions', async () => {
    expect(api.get).toHaveBeenCalledWith('/pages/id/permissions');
  });

  it('should add permissions', async () => {
    await api.addPermissions('pages', 'id', {
      permissions: {},
      target: { email: 'foo@bar.com' },
    });
    expect(api.post).toHaveBeenCalledWith('/pages/id/permissions', {
      permissions: {},
      target: {
        id: '1234',
      },
    });
  });

  it('should fail to add permissions', async () => {
    let expected: ApiError = {} as ApiError;
    try {
      await api.addPermissions('pages', 'id', {
        permissions: {},
        target: { email: 'foofoo@bar.com' },
      });
    } catch (e) {
      console.log(e);
      expected = e as ApiError;
    }
    expect(expected.message).toBe('This user does not exist');
  });

  it('should delete permissions', async () => {
    api.delete = jest.fn((): any => {});
    api.deletePermissions('pages', 'id', 'foo');
    expect(api.delete).toHaveBeenCalledWith('/pages/id/permissions/foo');
  });
});

it('should get apps', async () => {
  const api = new Api('/fake/');
  const get: jest.Mock = (api.get = jest.fn((): any => {}));
  api.getApps({});
  expect(api.get).toHaveBeenCalledWith('/apps?');
  get.mockClear();

  api.getApps({ query: 'foo' });
  expect(get).toHaveBeenCalledWith('/apps?text=foo');
  get.mockClear();

  api.getApps({ query: 'foo', page: 1, limit: 10, workspaceId: '42' });
  expect(get).toHaveBeenCalledWith(
    '/apps?text=foo&page=1&limit=10&workspaceId=42'
  );
});

it('should install app', async () => {
  const api = new Api('/fake/');
  api.post = jest.fn((): any => {});
  api.installApp('42', { appSlug: 'app' });
  expect(api.post).toHaveBeenCalledWith('/workspaces/42/apps', {
    appSlug: 'app',
  });
});

it('should update app', async () => {
  const api = new Api('/fake/');
  api.patch = jest.fn((): any => {});
  api.updateApp('42', 'app', { appSlug: 'app' });
  expect(api.patch).toHaveBeenCalledWith('/workspaces/42/apps/app', {
    appSlug: 'app',
  });
});

it('should uninstall app', async () => {
  const api = new Api('/fake/');
  api.delete = jest.fn((): any => {});
  api.uninstallApp('42', 'app');
  expect(api.delete).toHaveBeenCalledWith('/workspaces/42/apps/app');
});

it('should publish app', async () => {
  const api = new Api('/fake/');
  api.post = jest.fn((): any => {});
  api.publishApp({ workspaceId: '42' });
  expect(api.post).toHaveBeenCalledWith('/apps', { workspaceId: '42' });
});

it('should list app instances', async () => {
  const api = new Api('/fake/');
  api.get = jest.fn((): any => {});
  api.listAppInstances('42');
  expect(api.get).toHaveBeenCalledWith('/workspaces/42/apps');
});

it('should get app config', async () => {
  const api = new Api('/fake/');
  api.get = jest.fn((): any => {});
  api.getAppConfig('42', 'app');
  expect(api.get).toHaveBeenCalledWith('/workspaces/42/apps/app/config');
});

it('should update app config', async () => {
  const api = new Api('/fake/');
  api.patch = jest.fn((): any => {});
  api.updateAppConfig('42', 'app', {});
  expect(api.patch).toHaveBeenCalledWith('/workspaces/42/apps/app/config', {});
});

it('should save app instance', async () => {
  const api = new Api('/fake/');
  api.patch = jest.fn((): any => {});
  api.saveAppInstance('42', 'app', {});
  expect(api.patch).toHaveBeenCalledWith('/workspaces/42/apps/app', {});
});

it('should upload files', async () => {
  const api = new Api('/fake/');
  // @ts-ignore
  let fetch: jest.Mock = (api._fetch = jest.fn((): any => {}));
  api.uploadFiles('data:text/plain;base64,SGVsbG8gV29ybGQ', '42');
  // @ts-ignore
  expect(fetch).toHaveBeenCalledWith('/workspaces/42/files', {
    method: 'POST',
    body: expect.any(FormData),
  });

  expect(fetch.mock.calls[0][1].body.get('file')).toBeInstanceOf(Blob);
  fetch.mockClear();

  api.uploadFiles(['data:text/plain;text,Hello World'], '42');
  // @ts-ignore
  expect(fetch).toHaveBeenCalledWith('/workspaces/42/files', {
    method: 'POST',
    body: expect.any(FormData),
  });

  // @ts-ignore
  fetch = api._fetch = jest.fn((): any => {
    throw new Error();
  });
  const empty = await api.uploadFiles('data:text/plain;text,Hello World', '42');
  expect(empty).toEqual([]);
});

it('should call automation', () => {
  const api = new Api('/fake/');
  api.post = jest.fn((): any => {});
  api.callAutomation('42', 'automation');
  expect(api.post).toHaveBeenCalledWith(
    '/workspaces/42/webhooks/automation',
    undefined
  );
});

it('should get workspace usage', () => {
  const api = new Api('/fake/');
  const get: jest.Mock = (api.get = jest.fn((): any => {}));
  api.getWorkspaceUsage('42');
  expect(api.get).toHaveBeenCalledWith('/workspaces/42/usage?');
  get.mockClear();

  api.getWorkspaceUsage('42', {
    afterDate: '2022',
    beforeDate: undefined,
  });
  expect(api.get).toHaveBeenCalledWith('/workspaces/42/usage?afterDate=2022');
});

describe('Workspaces', () => {
  it('should access workspaces methods', () => {
    expect(api.workspaces('42')).toBeInstanceOf(WorkspacesEndpoint);
  });
  describe('Versions', () => {
    it('should access versions methods', () => {
      expect(api.workspaces('42').versions).toBeInstanceOf(
        WorkspacesVersionsEndpoint
      );
    });
    it('create', () => {
      api.post = jest.fn();
      api.workspaces('42').versions.create({ description: 'foo' });
      expect(api.post).toHaveBeenCalledWith('/workspaces/42/versions', {
        description: 'foo',
      });
    });
    it('rollback', () => {
      api.post = jest.fn();
      api.workspaces('42').versions.rollback('v1.0.0');
      expect(api.post).toHaveBeenCalledWith(
        '/workspaces/42/versions/v1.0.0/rollback'
      );
    });
  });
});

describe('User', () => {
  it('should access user methods', () => {
    expect(api.users('42')).toBeInstanceOf(UsersEndpoint);
  });
  it('should access user methods with current user', () => {
    // @ts-ignore
    api._user = { id: '42' } as any;
    expect(api.users()).toBeInstanceOf(UsersEndpoint);
  });

  it('should set meta data', () => {
    api.post = jest.fn();
    api.users().setMeta('foo', 'bar');
    expect(api.post).toHaveBeenCalledWith('/user/meta', {
      foo: 'bar',
    });
  });
  it('should delete meta data', () => {
    api.delete = jest.fn();
    api.users().deleteMeta('foo');
    expect(api.delete).toHaveBeenCalledWith('/user/meta/foo');
  });
});
