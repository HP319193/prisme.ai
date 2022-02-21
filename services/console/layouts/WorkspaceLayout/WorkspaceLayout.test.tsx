import WorkspaceLayout from './WorkspaceLayout';
import { getLayout } from './index';
import renderer, { act } from 'react-test-renderer';
import { useRouter } from 'next/router';
import { useWorkspaces } from '../../components/WorkspacesProvider';
import Events from '../../api/events';
import api from '../../api/api';
import { useWorkspace, WorkspaceContext } from './context';
import { Event, Workspace } from '../../api/types';
import { notification } from 'antd';

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

jest.mock('../../api/events', () => {
  class Events {
    static destroyMock = jest.fn();
    static listeners: any[] = [];
    all(listener: Function) {
      Events.listeners.push(listener);
      return () => {};
    }
    destroy() {
      Events.destroyMock();
    }
  }
  return Events;
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

it('should render empty', async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render 404', async () => {
  useRouter().query.id = '12';
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render fetching', async () => {
  (useWorkspaces().fetch as jest.Mock).mockImplementation(() => ({
    id: '42',
    name: 'foo',
    automations: [],
  }));
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it('should get layout', async () => {
  const root = renderer.create(getLayout(<div />));
  await act(async () => {
    await true;
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it('should destroy socket', async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  expect((Events as any).destroyMock).not.toHaveBeenCalled();

  act(() => {
    useRouter().query.id = '43';
  });
  await act(async () => {
    root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
    await true;
  });
  expect((Events as any).destroyMock).toHaveBeenCalled();
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
    <WorkspaceLayout>
      <Test />
    </WorkspaceLayout>
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
    <WorkspaceLayout>
      <Test />
    </WorkspaceLayout>
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

it('should save', async () => {
  useWorkspaces().update = jest.fn(async () => ({} as Workspace));
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceLayout>
      <Test />
    </WorkspaceLayout>
  );
  await act(async () => {
    await true;
  });
  act(() => {
    context.setNewSource({
      name: 'win',
      automations: {},
      createdAt: '',
      updatedAt: '',
      id: '',
    });
  });
  await act(async () => {
    await context.save();
  });

  expect(useWorkspaces().update).toHaveBeenCalledWith({
    name: 'win',
    automations: {},
    createdAt: '',
    updatedAt: '',
    id: '',
  });
  expect(notification.success).toHaveBeenCalledWith({
    message: 'expert.save.confirm',
    placement: 'bottomRight',
  });
});

it('should fail to save', async () => {
  useWorkspaces().update = jest.fn();
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceLayout>
      <Test />
    </WorkspaceLayout>
  );
  await act(async () => {
    await true;
  });
  act(() => {
    context.setNewSource({
      name: 'win',
      automations: {},
      createdAt: '',
      updatedAt: '',
      id: '',
    });
  });
  await act(async () => {
    await context.save();
  });
  expect(notification.error).toHaveBeenCalledWith({
    message: 'expert.save.fail',
    placement: 'bottomRight',
  });
});
