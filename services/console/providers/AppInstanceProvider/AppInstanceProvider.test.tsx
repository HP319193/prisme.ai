import renderer, { act } from 'react-test-renderer';
import {
  AppInstanceContext,
  AppInstanceProvider,
  useAppInstance,
} from './AppInstanceProvider';
import { workspaceContext } from '../Workspace';
import workspaceContextValue from '../Workspace/workspaceContextValue.mock';
import api, { Events } from '../../utils/api';

jest.mock('../../utils/api', () => {
  const mock = {
    getAppInstance: jest.fn((wid: string, id: string) => ({
      slug: 'my-app',
      appSlug: 'app',
    })),
    saveAppInstance: jest.fn(
      (wId: string, slug: string, a: Prismeai.AppInstance) => a
    ),
    uninstallApp: jest.fn((wId: string, slug: string) => {}),
  };
  return mock;
});

const off = jest.fn;
const events = ({
  on: jest.fn(() => off),
} as unknown) as Events;
it('should render', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <AppInstanceProvider
        workspaceId={workspaceContextValue.workspace.id}
        id="42"
        events={events}
      >
        Foo
      </AppInstanceProvider>
    </workspaceContext.Provider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

let context: AppInstanceContext;
const T = () => {
  context = useAppInstance();
  return null;
};

it('should fetch appInstance', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <AppInstanceProvider
        workspaceId={workspaceContextValue.workspace.id}
        id="my-app"
        events={events}
      >
        <T />
      </AppInstanceProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });
  expect(context.loading).toBe(false);
  expect(context.appInstance).toEqual({
    slug: 'my-app',
    appSlug: 'app',
  });
});

it('should refetch appInstance', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <AppInstanceProvider
        workspaceId={workspaceContextValue.workspace.id}
        id="my-app"
        events={events}
      >
        <T />
      </AppInstanceProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  expect(api.getAppInstance).toHaveBeenCalledWith('42', 'my-app');
  (api.getAppInstance as jest.Mock).mockClear();

  await act(async () => {
    const appInstance = await context.fetchAppInstance();
    expect(appInstance).toEqual({
      slug: 'my-app',
      appSlug: 'app',
    });
  });
  expect(api.getAppInstance).toHaveBeenCalledWith('42', 'my-app');
});

it('should save app instance', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <AppInstanceProvider
        workspaceId={workspaceContextValue.workspace.id}
        id="my-app"
        events={events}
      >
        <T />
      </AppInstanceProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    const newAppInstance = await context.saveAppInstance({
      appSlug: 'app',
    });
    expect(newAppInstance).toEqual({
      appSlug: 'app',
    });
  });
  expect(api.saveAppInstance).toHaveBeenCalledWith('42', 'my-app', {
    appSlug: 'app',
  });
});

it('should uninstall app instance', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <AppInstanceProvider
        workspaceId={workspaceContextValue.workspace.id}
        id="my-app"
        events={events}
      >
        <T />
      </AppInstanceProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    const deleted = await context.uninstallApp();
    expect(deleted).toEqual({
      appSlug: 'app',
      slug: 'my-app',
    });
  });
  expect(api.uninstallApp).toHaveBeenCalledWith('42', 'my-app');
});
