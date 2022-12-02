import renderer, { act } from 'react-test-renderer';
import { mock } from '../../components/UserProvider';
import api from '../../utils/api';
import WorkspacesProvider, {
  LoadingType,
  useWorkspaces,
} from './WorkspacesProvider';

jest.mock('../../components/UserProvider', () => {
  const mock = {
    user: {
      id: '42',
    },
  };
  return {
    useUser: () => mock,
    mock,
  };
});
jest.mock('../../utils/api', () => {
  const mock = {
    getWorkspaces: jest.fn(() => [
      {
        id: '1',
        createdAt: 'Fri Dec 02 2022 14:03:39 GMT+0100',
        updatedAt: 'Fri Dec 02 2022 14:03:39 GMT+0100',
      },
    ]),
    createWorkspace: jest.fn(() => ({})),
    duplicateWorkspace: jest.fn(() => ({})),
  };
  return mock;
});
it('should render', () => {
  const root = renderer.create(<WorkspacesProvider>Foo</WorkspacesProvider>);
  expect(root.toJSON()).toMatchSnapshot();

  act(() => {});

  expect(api.getWorkspaces).toHaveBeenCalled();
});

it('should refetch when user changes', async () => {
  const root = renderer.create(<WorkspacesProvider>Foo</WorkspacesProvider>);
  expect(root.toJSON()).toMatchSnapshot();

  act(() => {});

  expect(api.getWorkspaces).toHaveBeenCalled();

  (api.getWorkspaces as jest.Mock).mockClear();

  act(() => {});

  expect(api.getWorkspaces).not.toHaveBeenCalled();

  await act(async () => {
    // @ts-ignore
    mock.user = { id: '43' };
    await true;
  });

  expect(api.getWorkspaces).toHaveBeenCalled();
});

it('should load', async () => {
  let loading: ReturnType<typeof useWorkspaces>['loading'] = new Map();
  let workspaces: ReturnType<typeof useWorkspaces>['workspaces'] = [];
  const T = () => {
    const context = useWorkspaces();
    loading = context.loading;
    workspaces = context.workspaces;
    return null;
  };
  const root = renderer.create(
    <WorkspacesProvider>
      <T />
    </WorkspacesProvider>
  );

  expect(loading.get(LoadingType.List)).toBe(true);

  await act(async () => {
    await true;
  });

  expect(loading.get(LoadingType.List)).toBe(false);
  expect(workspaces.length).toBe(1);
  expect(workspaces[0].updatedAt).toBeInstanceOf(Date);
  expect(workspaces[0].createdAt).toBeInstanceOf(Date);
});

it('should create a workspace', async () => {
  let createWorkspace: ReturnType<typeof useWorkspaces>['createWorkspace'];
  let loading: ReturnType<typeof useWorkspaces>['loading'] = new Map();
  const T = () => {
    const context = useWorkspaces();
    createWorkspace = context.createWorkspace;
    loading = context.loading;
    return null;
  };
  const root = renderer.create(
    <WorkspacesProvider>
      <T />
    </WorkspacesProvider>
  );

  act(() => {
    createWorkspace('Foo');
  });

  expect(loading.get(LoadingType.New)).toBe(true);

  await act(async () => {
    await true;
  });

  expect(api.createWorkspace).toHaveBeenCalledWith('Foo');

  expect(loading.get(LoadingType.New)).toBe(false);
});

it('should duplicate a workspace', async () => {
  let duplicateWorkspace: ReturnType<
    typeof useWorkspaces
  >['duplicateWorkspace'];
  let loading: ReturnType<typeof useWorkspaces>['loading'] = new Map();
  const T = () => {
    const context = useWorkspaces();
    duplicateWorkspace = context.duplicateWorkspace;
    loading = context.loading;
    return null;
  };
  const root = renderer.create(
    <WorkspacesProvider>
      <T />
    </WorkspacesProvider>
  );

  act(() => {
    duplicateWorkspace('42');
  });

  expect(loading.get('42')).toBe(true);

  await act(async () => {
    await true;
  });

  expect(api.duplicateWorkspace).toHaveBeenCalledWith({ id: '42' });

  expect(loading.get('42')).toBe(false);
});
