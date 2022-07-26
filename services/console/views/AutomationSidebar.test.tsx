import AutomationsSidebar from './AutomationsSidebar';
import renderer, { act } from 'react-test-renderer';
import { useRouter } from 'next/router';
import { Button } from '@prisme.ai/design-system';
import { useWorkspace } from '../components/WorkspaceProvider';

jest.mock('../components/WorkspacesProvider', () => {
  const createAutomation = jest.fn((w, automation) => ({
    slug: `${w.id}-1`,
    ...automation,
  }));
  return {
    useWorkspaces: () => ({
      createAutomation,
    }),
  };
});
jest.mock('../components/WorkspaceProvider', () => {
  const mock = {
    workspace: {
      id: '42',
      automations: {
        '42-1': {
          name: 'First',
          do: [],
        },
      },
    },
    createAutomation: jest.fn((a: any) => ({ ...a, slug: a.name })),
  };
  return {
    useWorkspace: () => mock,
  };
});
jest.mock('next/router', () => {
  const push = jest.fn();
  return {
    useRouter: () => ({
      query: {
        id: '42',
        name: 'foo',
      },
      push,
    }),
  };
});
it('should render', () => {
  const root = renderer.create(<AutomationsSidebar />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should create an automation', async () => {
  const root = renderer.create(<AutomationsSidebar />);
  await act(async () => {
    await root.root.findByType(Button).props.onClick();
  });
  expect(useWorkspace().createAutomation).toHaveBeenCalledWith({
    name: 'automations.create.defaultName',
    do: [],
  });
  expect(useRouter().push).toHaveBeenCalledWith(
    '/workspaces/42/automations/automations.create.defaultName'
  );
});
it('should create an automation with existing name', async () => {
  useWorkspace().workspace.automations = {
    '44': {
      name: 'automations.create.defaultName',
      do: [],
    },
  };
  const root = renderer.create(<AutomationsSidebar />);
  await act(async () => {
    await root.root.findByType(Button).props.onClick();
  });
  expect(useWorkspace().createAutomation).toHaveBeenCalledWith({
    name: 'automations.create.defaultName (1)',
    do: [],
  });
});
