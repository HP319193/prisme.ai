import renderer, { act } from 'react-test-renderer';

import { workspaceContext } from '../Workspace';
import workspaceContextValue from '../Workspace/workspaceContextValue.mock';
import api from '../../utils/api';
import {
  AutomationContext,
  AutomationProvider,
  useAutomation,
} from './AutomationProvider';

jest.mock('../../utils/api', () => {
  const mock = {
    getAutomation: jest.fn((workspaceId: string, slug: string) => ({
      slug,
      name: 'My automation',
      do: [],
    })),
    updateAutomation: jest.fn(
      (workspaceId: string, slug: string, data: any) => ({
        ...data,
        slug,
      })
    ),
    deleteAutomation: jest.fn(),
  };
  return mock;
});

it('should render', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <AutomationProvider
        workspaceId={workspaceContextValue.workspace.id}
        automationSlug="42"
      >
        Foo
      </AutomationProvider>
    </workspaceContext.Provider>
  );

  await act(async () => {
    await true;
  });

  expect(root.toJSON()).toMatchSnapshot();
});

let context: AutomationContext;
const T = () => {
  context = useAutomation();
  return null;
};

it('should fetch automation', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <AutomationProvider
        workspaceId={workspaceContextValue.workspace.id}
        automationSlug="my-automation"
      >
        <T />
      </AutomationProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });
  expect(context.loading).toBe(false);
  expect(context.automation).toEqual({
    slug: 'my-automation',
    name: 'My automation',
    do: [],
  });
});

it('should refetch automation', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <AutomationProvider
        workspaceId={workspaceContextValue.workspace.id}
        automationSlug="my-automation"
      >
        <T />
      </AutomationProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  expect(api.getAutomation).toHaveBeenCalledWith('42', 'my-automation');
  (api.getAutomation as jest.Mock).mockClear();

  await act(async () => {
    const appInstance = await context.fetchAutomation();
    expect(appInstance).toEqual({
      slug: 'my-automation',
      name: 'My automation',
      do: [],
    });
  });
  expect(api.getAutomation).toHaveBeenCalledWith('42', 'my-automation');
});

it('should save automation', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <AutomationProvider
        workspaceId={workspaceContextValue.workspace.id}
        automationSlug="my-automation"
      >
        <T />
      </AutomationProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    const newAppInstance = await context.saveAutomation({
      name: 'My automation',
      do: [
        {
          emit: {
            event: 'foo',
          },
        },
      ],
    });
    expect(newAppInstance).toEqual({
      slug: 'my-automation',
      name: 'My automation',
      do: [
        {
          emit: {
            event: 'foo',
          },
        },
      ],
    });
  });
  expect(api.updateAutomation).toHaveBeenCalledWith('42', 'my-automation', {
    name: 'My automation',
    do: [
      {
        emit: {
          event: 'foo',
        },
      },
    ],
  });
});

it('should delete automation', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <AutomationProvider
        workspaceId={workspaceContextValue.workspace.id}
        automationSlug="my-automation"
      >
        <T />
      </AutomationProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    const deleted = await context.deleteAutomation();
    expect(deleted).toEqual({
      slug: 'my-automation',
      name: 'My automation',
      do: [],
    });
  });
  expect(api.deleteAutomation).toHaveBeenCalledWith('42', 'my-automation');
});
