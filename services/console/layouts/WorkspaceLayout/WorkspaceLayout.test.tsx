import WorkspaceLayout from './WorkspaceLayout';
import { getLayout } from './index';
import renderer, { act } from 'react-test-renderer';
import { useRouter } from 'next/router';
import { useWorkspaces } from '../../providers/Workspaces';
import WorkspaceSource from '../../views/WorkspaceSource';
import { useWorkspaceLayout, WorkspaceLayoutContext } from './context';

jest.useFakeTimers();

jest.mock('../../components/UserProvider', () => {
  const mock = {
    user: {},
  };
  return {
    useUser: () => mock,
  };
});

jest.mock('../../providers/Workspaces', () => {
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
    events: {
      on: jest.fn(),
    },
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
  }

  const api: any = new Api();
  api.Api = Api;
  api.Events = FakeEvents;
  return api;
});

jest.mock('./Navigation', () => () => null);

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

it('should get layout', async () => {
  const root = renderer.create(getLayout(<div />));
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

it('should display source after mount', async () => {
  jest.useFakeTimers();
  let context: WorkspaceLayoutContext = {} as WorkspaceLayoutContext;
  const Test = () => {
    context = useWorkspaceLayout();
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
  expect(root.root.findAllByType('div')[0].props.className).toContain(
    '-translate-y-full'
  );
  expect(() => root.root.findByType(WorkspaceSource)).toThrow();

  act(() => {
    context.displaySource(true);
  });
  expect(root.root.findByType(WorkspaceSource)).toBeDefined();
  act(() => {
    root.root.findByType(WorkspaceSource).props.onLoad();
  });
  expect(root.root.findAllByType('div')[0].props.className).not.toContain(
    '-translate-y-100'
  );
});
