import renderer, { act } from 'react-test-renderer';
import api from '../../utils/api';
import WorkspaceProvider, {
  useWorkspace,
  WorkspaceContext,
} from './WorkspaceProvider';

jest.mock('../../utils/api', () => {
  const workspaceContextValue = require('./workspaceContextValue.mock').default;

  const mock = {
    getWorkspace: jest.fn((id: string) => ({
      id,
      name: 'Foo',
    })),
    streamEvents: jest.fn((id: string) => workspaceContextValue.events),
    updateWorkspace: jest.fn((w: any) => w),
    deleteWorkspace: jest.fn((id: string) => ({
      id,
      name: 'Foo',
    })),
    createAutomation: jest.fn((wid: string, a: any) => ({
      id: '1',
      slug: 'foo-bar',
      ...a,
    })),
    createPage: jest.fn((wid: string, p: any) => ({
      id: '1',
      slug: 'foo-bar',
      ...p,
    })),
    installApp: jest.fn((wid: string, a: any) => ({
      id: '1',
      ...a,
      slug: a.appSlug,
    })),
  };
  return mock;
});
it('should render', async () => {
  const root = renderer.create(
    <WorkspaceProvider id="42">Foo</WorkspaceProvider>
  );
  expect(root.toJSON()).toMatchSnapshot();

  await act(async () => {
    await true;
  });

  expect(api.getWorkspace).toHaveBeenCalledWith('42');
});

it('should fetch workspace', async () => {
  let context = {} as WorkspaceContext;
  const T = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider id="42">
      <T />
    </WorkspaceProvider>
  );

  await act(async () => {
    await true;
  });

  expect(context.workspace).toEqual({
    id: '42',
    name: 'Foo',
  });
});

it('should fetch another workspace', async () => {
  let context = {} as WorkspaceContext;
  const T = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider id="42">
      <T />
    </WorkspaceProvider>
  );

  await act(async () => {
    await true;
  });

  expect(context.workspace).toEqual({
    id: '42',
    name: 'Foo',
  });

  root.update(
    <WorkspaceProvider id="43">
      <T />
    </WorkspaceProvider>
  );

  await act(async () => {
    await true;
  });

  expect(context.workspace).toEqual({
    id: '43',
    name: 'Foo',
  });
});

it('should save workspace', async () => {
  let context = {} as WorkspaceContext;
  const T = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider id="42">
      <T />
    </WorkspaceProvider>
  );

  let expected: any;
  await act(async () => {
    await true;
  });
  await act(async () => {
    expected = await context.saveWorkspace({
      name: 'Bar',
    });
  });

  expect(expected).toEqual({
    id: '42',
    name: 'Bar',
  });

  expect(context.workspace).toEqual({
    id: '42',
    name: 'Bar',
  });
});

it('should delete workspace', async () => {
  let context = {} as WorkspaceContext;
  const T = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider id="42">
      <T />
    </WorkspaceProvider>
  );

  let expected: any;
  await act(async () => {
    await true;
  });
  await act(async () => {
    expected = await context.deleteWorkspace();
  });

  expect(expected).toEqual({
    id: '42',
    name: 'Foo',
  });

  expect(root.toJSON()).toMatchSnapshot();
});

it('should create automation', async () => {
  let context = {} as WorkspaceContext;
  const T = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider id="42">
      <T />
    </WorkspaceProvider>
  );

  let expected: any;
  await act(async () => {
    await true;
  });
  await act(async () => {
    expected = await context.createAutomation({ name: 'Automation', do: [] });
  });

  expect(expected).toEqual({
    id: '1',
    slug: 'foo-bar',
    name: 'Automation',
    do: [],
  });
});

it('should create page', async () => {
  let context = {} as WorkspaceContext;
  const T = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider id="42">
      <T />
    </WorkspaceProvider>
  );

  let expected: any;
  await act(async () => {
    await true;
  });
  await act(async () => {
    expected = await context.createPage({ name: 'Page' });
  });

  expect(expected).toEqual({
    id: '1',
    slug: 'foo-bar',
    name: 'Page',
  });
});

it('should install app', async () => {
  let context = {} as WorkspaceContext;
  const T = () => {
    context = useWorkspace();
    return null;
  };
  const root = renderer.create(
    <WorkspaceProvider id="42">
      <T />
    </WorkspaceProvider>
  );

  let expected: any;
  await act(async () => {
    await true;
  });
  await act(async () => {
    expected = await context.installApp({ appSlug: 'Foo', appName: 'Foo' });
  });

  expect(expected).toEqual({
    id: '1',
    slug: 'Foo',
    appSlug: 'Foo',
    appName: 'Foo',
  });
});
