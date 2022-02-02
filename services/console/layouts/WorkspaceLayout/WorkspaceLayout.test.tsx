import WorkspaceLayout from './WorkspaceLayout';
import { getLayout } from './index';
import renderer, { act } from 'react-test-renderer';
import { useRouter } from 'next/router';
import { useWorkspaces } from '../../components/WorkspacesProvider';
import EditableTitle from '../../components/EditableTitle';
import { Button } from 'primereact/button';
import AutomationsSidebar from '../../views/AutomationsSidebar';
import SidePanel from '../SidePanel';
import Events from '../../api/events';
import api from '../../api/api';
import { useWorkspace, WorkspaceContext } from './context';
import { Event } from '../../api/types';
import { useToaster } from '../Toaster';
import { confirmDialog } from 'primereact/confirmdialog';

jest.useFakeTimers();

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

jest.mock('primereact/button', () => {
  return { Button: () => null };
});

jest.mock('../Toaster', () => {
  const mock = {
    show: jest.fn(),
  };
  return { useToaster: () => mock };
});

jest.mock('primereact/confirmdialog', () => {
  const mock = jest.fn();
  return { confirmDialog: mock };
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

it('should render loading', async () => {
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

it('should update title', async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });

  act(() => {
    root.root.findByType(EditableTitle).props.onChange('bar');
  });
  expect(useWorkspaces().update).toHaveBeenCalledWith({
    id: '42',
    name: 'bar',
    automations: [],
  });
});

it('should display automations', async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    root.root.findAllByType(Button)[0].props.onClick();
    jest.runAllTimers();
  });
  expect(root.root.findByType(AutomationsSidebar)).toBeDefined();
});

it('should close sidepanel', async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    root.root.findByType(SidePanel).props.onClose();
  });
  expect(root.root.findByType(SidePanel).props.sidebarOpen).toBe(false);
});

it('should close automations sidepanel', async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    root.root.findByType(AutomationsSidebar).props.onClose();
  });
  expect(root.root.findByType(SidePanel).props.sidebarOpen).toBe(false);
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
  act(() => {
    return;
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

  expect(useToaster().show).toHaveBeenCalledWith({
    severity: 'success',
    summary: 'expert.save.confirm',
  });
});

it('should display automations', () => {
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
  act(() => {
    return;
  });

  const link = root.root.find(
    (a) => a.type === Button && a.props.children === 'automations.link'
  );
  act(() => {
    link.props.onClick();
  });

  expect(root.root.findByType(AutomationsSidebar)).toBeDefined();
});

it('should ask before leaving source edition', async () => {
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  };
  useRouter().route = '/workspace/42/source';
  const root = renderer.create(
    <WorkspaceLayout>
      <Test />
    </WorkspaceLayout>
  );
  await act(async () => {
    await true;
  });

  act(() => {
    context.setDirty(true);
  });
  const e = { preventDefault: jest.fn() };
  act(() => {
    root.root.find((el) => el.props.icon === 'pi pi-code').props.onClick(e);
  });
  expect(e.preventDefault).toHaveBeenCalled();
  expect(confirmDialog).toHaveBeenCalledWith({
    message: 'expert.exit.confirm_message',
    header: 'expert.exit.confirm_title',
    icon: 'pi pi-exclamation-triangle',
    accept: expect.any(Function),
  });

  (confirmDialog as jest.Mock).mock.calls[0][0].accept();
  expect(useRouter().push).toHaveBeenCalledWith('/workspaces/42');
});
