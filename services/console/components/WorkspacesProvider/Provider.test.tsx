import Provider from './Provider';
import renderer, { act } from 'react-test-renderer';
import api from '../../utils/api';
import { useWorkspaces } from './context';
import { useUser } from '../UserProvider';

jest.mock('../UserProvider', () => {
  const mock = {
    user: {},
  };
  return {
    useUser: () => mock,
  };
});

beforeEach(() => {
  jest.resetAllMocks();
});

it('should access context', async () => {
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  expect(context.workspaces).toEqual(new Map());
  expect(context.get).toBeInstanceOf(Function);
  expect(context.fetch).toBeInstanceOf(Function);
  expect(context.create).toBeInstanceOf(Function);
  expect(context.update).toBeInstanceOf(Function);
});

it('should fetch workspaces', async () => {
  jest.spyOn(api, 'getWorkspaces').mockReturnValue(
    Promise.resolve([
      {
        id: '42',
        name: 'workspace',
      },
    ] as any)
  );

  useUser().user = {} as any;
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await true;
  });
  expect(api.getWorkspaces).toHaveBeenCalled();
  expect(context.workspaces).toEqual(
    new Map([
      [
        '42',
        {
          id: '42',
          name: 'workspace',
        },
      ],
    ])
  );
});

it('should not fetch workspaces', async () => {
  jest.spyOn(api, 'getWorkspaces').mockReturnValue(
    Promise.resolve([
      {
        id: '42',
        name: 'workspace',
      },
    ] as any)
  );
  useUser().user = null as any;
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await true;
  });
  expect(api.getWorkspaces).not.toHaveBeenCalled();
  expect(context.workspaces).toEqual(new Map());
});

it('should create a workspace', async () => {
  jest.spyOn(api, 'getWorkspaces').mockReturnValue(Promise.resolve([]));
  jest.spyOn(api, 'createWorkspace').mockReturnValue(
    Promise.resolve({
      id: 'new',
      name: 'new',
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    const expected = await context.create('new');
    expect(api.createWorkspace).toHaveBeenCalledWith('new');
    expect(expected).toEqual({
      id: 'new',
      name: 'new',
    });
  });
});

it('should create many workspace', async () => {
  jest.spyOn(api, 'getWorkspaces').mockReturnValue(Promise.resolve([]));
  jest.spyOn(api, 'createWorkspace').mockReturnValue(
    Promise.resolve({
      id: 'new (1)',
      name: 'new (1)',
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    context.workspaces.set('new', {
      name: 'new',
    });
    const expected = await context.create('new');
    expect(api.createWorkspace).toHaveBeenCalledWith('new (1)');
    expect(expected).toEqual({
      id: 'new (1)',
      name: 'new (1)',
    });
  });
});

it('should fetch a workspace', async () => {
  jest.spyOn(api, 'getWorkspaces').mockReturnValue(Promise.resolve([]));
  jest.spyOn(api, 'getWorkspace').mockReturnValue(
    Promise.resolve({
      id: '42',
      name: 'fourtytwo',
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    const expected = await context.fetch('42');
    expect(api.getWorkspace).toHaveBeenCalledWith('42');
    expect(expected).toEqual({
      id: '42',
      name: 'fourtytwo',
    });
  });
});

it('should get a workspace', async () => {
  useUser().user = {} as any;
  jest.spyOn(api, 'getWorkspaces').mockReturnValue(
    Promise.resolve([
      {
        id: '42',
        name: 'fourtytwo',
      },
    ] as any)
  );
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await true;
  });
  const expected = context.get('42');
  expect(expected).toEqual({
    id: '42',
    name: 'fourtytwo',
  });
});

it('should update a workspace', async () => {
  jest.spyOn(api, 'getWorkspaces').mockReturnValue(Promise.resolve([]));
  jest.spyOn(api, 'updateWorkspace').mockReturnValue(
    Promise.resolve({
      id: '42',
      name: 'foo',
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    context.workspaces.set('42', {
      id: '42',
      name: 'foo',
    });
    const expected = await context.update({
      id: '42',
      name: 'foo',
    });
    expect(api.updateWorkspace).toHaveBeenCalledWith({
      id: '42',
      name: 'foo',
    });
    expect(expected).toEqual({
      id: '42',
      name: 'foo',
    });
  });
});

it('should fail to update a workspace', async () => {
  useUser().user = {} as any;
  jest.spyOn(api, 'getWorkspaces').mockReturnValue(
    Promise.resolve([
      {
        id: '42',
        name: 'foo',
      },
    ] as any)
  );
  jest.spyOn(api, 'updateWorkspace').mockRejectedValue('fail');
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await true;
  });
  await act(async () => {
    const expected = await context.update({
      id: '42',
      name: 'foo',
    });
    expect(api.updateWorkspace).toHaveBeenCalledWith({
      id: '42',
      name: 'foo',
    });
    expect(expected).toBeNull();
  });
});

it('should update an app', async () => {
  const updatedAppInstance = {
    appId: 'new id',
    appName: 'new name',
    appVersion: '2',
    slug: 'monappId',
  };
  const workspace = {
    id: '42',
    name: 'foo',
    imports: {
      monappId: {
        appId: 'monappId',
        appName: "le nom de l'app",
        appVersion: '1',
        slug: 'monappId',
      },
    },
  };
  jest
    .spyOn(api, 'getWorkspaces')
    .mockReturnValue(Promise.resolve([workspace] as any));

  // useUser().user = {} as any;
  jest
    .spyOn(api, 'updateApp')
    .mockReturnValue(Promise.resolve(updatedAppInstance as any));

  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    context.updateApp('42', 'monappId', {
      appId: 'new id',
      appName: 'new name',
      appVersion: '2',
      slug: 'monappId',
    });
  });

  await act(async () => {
    const w = await context.workspaces.get('42');
    expect(w).toEqual({
      id: '42',
      name: 'foo',
      imports: {
        monappId: {
          appId: 'new id',
          appName: 'new name',
          appVersion: '2',
          slug: 'monappId',
        },
      },
    });
  });
});

it('should uninstall an app', async () => {
  const workspace = {
    id: '42',
    name: 'foo',
    imports: {
      monappId: {
        appId: 'monappId',
        appName: "le nom de l'app",
        appVersion: '1',
        slug: 'monappId',
      },
    },
  };
  jest
    .spyOn(api, 'getWorkspaces')
    .mockReturnValue(Promise.resolve([workspace] as any));

  // useUser().user = {} as any;
  jest
    .spyOn(api, 'uninstallApp')
    .mockReturnValue(Promise.resolve({ id: 'monappId' } as any));

  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    context.uninstallApp('42', 'monappId');
  });

  await act(async () => {
    const w = await context.workspaces.get('42');
    expect(w).toEqual({
      id: '42',
      name: 'foo',
      imports: {},
    });
  });
});
