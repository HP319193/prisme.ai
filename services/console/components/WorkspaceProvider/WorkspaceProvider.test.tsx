import renderer, { act } from 'react-test-renderer';
import { useRouter } from 'next/router';
import { useWorkspaces } from '../../components/WorkspacesProvider';
import api from '../../utils/api';
import { Event, Events, Workspace } from '@prisme.ai/sdk';
import { useWorkspace, WorkspaceContext } from './context';
import WorkspaceProvider from './Provider';

jest.useFakeTimers();

jest.mock('../../components/UserProvider', () => {
  const mock = {
    user: {},
  };
  return {
    useUser: () => mock,
  };
});

jest.mock('../../components/WorkspacesProvider', () => {
  const mock = {};
  return {
    useWorkspaces: () => mock,
  };
});
jest.mock('../../views/WorkspaceSource', () => {
  const WorkspaceSource = () => <div>CodeEditor</div>;
  return WorkspaceSource;
});
jest.mock('next/router', () => {
  const query = { id: '42' };
  const mock = {
    query,
    route: '/workspace/42',
    push: jest.fn(),
  };
  return {
    useRouter: () => mock,
  };
});

jest.mock('@prisme.ai/sdk', () => {
  class FakeEvents {
    static destroyMock = jest.fn();
    static listeners: any[] = [];
    all(listener: Function) {
      FakeEvents.listeners.push(listener);
      return () => {
        FakeEvents.listeners = [];
      };
    }
    destroy() {
      FakeEvents.destroyMock();
    }
  }
  const mockEvents = new FakeEvents();

  class Api {
    streamEvents() {
      return mockEvents;
    }
    getEvents() {
      return [];
    }
    createAutomation = jest.fn((w: any, a: any) => ({
      slug: `${w.id}-1`,
      ...a,
    }));
    updateAutomation = jest.fn((w: any, s: string, a: any) => ({
      slug: s,
      ...a,
    }));
    deleteAutomation = jest.fn((w: any, slug: string) => ({
      slug,
    }));
    getWorkspace = jest.fn((id: string) => ({
      id: '42',
      name: 'foo',
      automations: [],
    }));
    getWorkspaces = jest.fn((id: string) => [
      {
        id: '42',
        name: 'foo',
        automations: [],
      },
    ]);
    installApp = jest.fn();
  }

  const api: any = new Api();
  api.Api = Api;
  api.Events = FakeEvents;
  return api;
});

beforeEach(() => {
  useRouter().query.id = '42';
  (useWorkspaces() as any).workspaces = new Map([
    [
      '42',
      {
        id: '42',
        name: 'foo',
        automations: [],
      },
    ],
    [
      '43',
      {
        id: '43',
        name: 'bar',
        automations: [],
      },
    ],
    ['12', null],
  ]);
  (useWorkspaces() as any).fetch = jest.fn();
  (useWorkspaces() as any).update = jest.fn();
});

it('should load events', async () => {
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  jest.spyOn(api, 'getEvents').mockImplementation(async () => {
    return [
      {
        id: '1',
        createdAt: new Date('2012-01-01 12:12'),
      },
      {
        id: '2',
        createdAt: new Date('2012-01-03'),
      },
      {
        id: '3',
        createdAt: new Date('2012-01-01 16:12'),
      },
      {
        id: '4',
        createdAt: new Date('2012-01-01 01:12'),
      },
      {
        id: '5',
        createdAt: new Date('2012-01-02'),
      },
    ] as Event<Date>[];
  });
  const root = renderer.create(
    <WorkspaceProvider>
      <Test />
    </WorkspaceProvider>
  );
  await act(async () => {
    await true;
  });

  expect(context.events).toEqual(
    new Map([
      [
        1325376000000,
        new Set([
          {
            id: '3',
            createdAt: new Date('2012-01-01 16:12'),
          },
          {
            id: '1',
            createdAt: new Date('2012-01-01 12:12'),
          },
          {
            id: '4',
            createdAt: new Date('2012-01-01 01:12'),
          },
        ]),
      ],
      [
        1325548800000,
        new Set([
          {
            id: '2',
            createdAt: new Date('2012-01-03'),
          },
        ]),
      ],
      [
        1325462400000,
        new Set([
          {
            id: '5',
            createdAt: new Date('2012-01-02'),
          },
        ]),
      ],
    ])
  );
});

it('should listen to events on socket', async () => {
  jest.spyOn(api, 'getEvents').mockImplementation(async () => []);
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  (Events as any).listeners = [];
  const root = renderer.create(
    <WorkspaceProvider>
      <Test />
    </WorkspaceProvider>
  );
  await act(async () => {
    await true;
  });

  act(() => {
    (Events as any).listeners.forEach((listener: Function) => {
      listener('apps.event', {
        createdAt: new Date('2021-01-01'),
      });
    });
  });
  expect(context.events).toEqual(
    new Map([[1609459200000, new Set([{ createdAt: new Date('2021-01-01') }])]])
  );

  act(() => {
    (Events as any).listeners.forEach((listener: Function) => {
      listener('apps.event', {
        createdAt: new Date('2021-01-02'),
      });
    });
  });
  expect(context.events).toEqual(
    new Map([
      [1609459200000, new Set([{ createdAt: new Date('2021-01-01') }])],
      [1609545600000, new Set([{ createdAt: new Date('2021-01-02') }])],
    ])
  );
});

it('should install a new app', async () => {
  const newAppInstance = {
    appSlug: 'monappId',
    appName: "le nom de l'app",
    appVersion: '1',
    slug: 'monappId',
  };
  jest.spyOn(api, 'getWorkspace').mockReturnValue(
    Promise.resolve({
      id: '42',
      name: 'foo',
      automations: [],
    } as any)
  );

  jest
    .spyOn(api, 'installApp')
    .mockReturnValue(Promise.resolve(newAppInstance as any));

  let context: any = {};
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider>
      <Test />
    </WorkspaceProvider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    context.installApp('42', {
      appSlug: 'monappId',
      appName: "le nom de l'app",
      appVersion: '1',
    });
  });

  await act(async () => {
    const w = await context.workspace;
    expect(w).toEqual({
      id: '42',
      name: 'foo',
      automations: [],
      imports: {
        monappId: {
          appSlug: 'monappId',
          appName: "le nom de l'app",
          appVersion: '1',
          slug: 'monappId',
        },
      },
    });
  });
});

it('should save', async () => {
  useWorkspaces().update = jest.fn(async (input: Workspace) => input);
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider>
      <Test />
    </WorkspaceProvider>
  );
  await act(async () => {
    await true;
  });

  let saveSourceResponse;

  await act(async () => {
    saveSourceResponse = await context.saveSource({
      name: 'win',
      automations: {},
      createdAt: '',
      updatedAt: '',
      id: '',
    });
  });

  expect(useWorkspaces().update).toHaveBeenCalledWith({
    name: 'win',
    automations: {},
    createdAt: '',
    updatedAt: '',
    id: '',
  });
  expect(saveSourceResponse).toEqual({
    name: 'win',
    automations: {},
    createdAt: '',
    updatedAt: '',
    id: '',
  });
});

it('should destroy socket', async () => {
  (Events as any).destroyMock.mockClear();
  useRouter().query.id = '42';
  const root = renderer.create(<WorkspaceProvider>Foo</WorkspaceProvider>);
  expect((Events as any).destroyMock).not.toHaveBeenCalled();

  await act(async () => {
    useRouter().query.id = '43';
    await true;
  });
  expect((Events as any).destroyMock).toHaveBeenCalled();
});

it('should create an automation', async () => {
  useWorkspaces().update = jest.fn(async (input: Workspace) => input);
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider>
      <Test />
    </WorkspaceProvider>
  );
  await act(async () => {
    await true;
  });
  await act(async () => {
    const w = await context.createAutomation({ name: 'foo', do: [] });
    expect(w).toEqual({
      slug: '42-1',
      name: 'foo',
      do: [],
    });
  });

  expect(api.createAutomation).toHaveBeenCalledWith(
    {
      id: '42',
      name: 'foo',
      automations: [],
    },
    {
      name: 'foo',
      do: [],
    }
  );

  expect(context.workspace.automations).toEqual({
    '42-1': {
      name: 'foo',
      do: [],
    },
  });
});

it('should update an automation', async () => {
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider>
      <Test />
    </WorkspaceProvider>
  );
  await act(async () => {
    await true;
  });
  await act(async () => {
    const w = await context.updateAutomation('foo', {
      name: 'bar',
      do: [],
    });
    expect(w).toEqual({
      slug: 'foo',
      name: 'bar',
      do: [],
    });
  });

  expect(api.updateAutomation).toHaveBeenCalled();

  expect(context.workspace).toEqual({
    id: '42',
    name: 'foo',
    automations: {
      foo: {
        name: 'bar',
        do: [],
      },
    },
  });
});

it('should update an automation slug', async () => {
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider>
      <Test />
    </WorkspaceProvider>
  );
  await act(async () => {
    await true;
  });
  context.workspace.automations = context.workspace.automations || {};
  context.workspace.automations.foo = {
    name: 'Foo',
    do: [],
  };
  await act(async () => {
    await context.updateAutomation('foo', {
      name: 'bar',
      do: [],
      slug: 'bar',
    });
  });

  expect(api.updateAutomation).toHaveBeenCalled();

  expect(context.workspace).toEqual({
    id: '42',
    name: 'foo',
    automations: {
      bar: {
        name: 'bar',
        do: [],
      },
    },
  });
});

it('should delete an automation', async () => {
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider>
      <Test />
    </WorkspaceProvider>
  );
  await act(async () => {
    await true;
  });
  context.workspace.automations = context.workspace.automations || {};
  context.workspace.automations.foo = {
    name: 'Foo',
    do: [],
  };
  await act(async () => {
    await context.deleteAutomation('foo');
  });

  expect(api.deleteAutomation).toHaveBeenCalled();

  expect(context.workspace).toEqual({
    id: '42',
    name: 'foo',
    automations: {},
  });
});
