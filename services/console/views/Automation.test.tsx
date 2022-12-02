import Automation from './Automation';
import renderer, { act } from 'react-test-renderer';
import AutomationBuilder from '../components/AutomationBuilder';
import { useRouter } from 'next/router';
import useKeyboardShortcut from '../components/useKeyboardShortcut';
import { notification } from '@prisme.ai/design-system';
import EditDetails from '../layouts/EditDetails';
import { useWorkspace } from '../providers/Workspace';
import { PageHeader } from 'antd';

jest.mock('../utils/useYaml', () => {
  const toJSON = jest.fn();
  const toYaml = jest.fn();
  const useYaml = jest.fn(() => ({
    toJSON,
    toYaml,
  }));
  return useYaml;
});

jest.mock('next/router', () => {
  const mock = {
    query: {
      automationId: 'foo',
    },
    replace: jest.fn(),
  };
  return {
    useRouter: () => mock,
  };
});

jest.mock('../components/useKeyboardShortcut', () => jest.fn());

jest.mock('../components/AutomationBuilder', () => () => null);

beforeEach(() => {
  useWorkspace().workspace = {
    id: '42',
    name: 'foo',
    createdAt: '',
    updatedAt: '',
    automations: {
      foo: {
        name: 'Hello',
        do: [],
      },
      bar: {
        name: 'World',
        do: [],
      },
    },
  };

  useRouter().query.automationId = 'foo';
});

it('should render', () => {
  const root = renderer.create(<Automation />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render redirect', () => {
  useRouter().query.automationId = 'not found';
  const root = renderer.create(<Automation />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should update value', async () => {
  const root = renderer.create(<Automation />);
  expect(root.root.findByType(AutomationBuilder).props.value).toEqual({
    name: 'Hello',
    do: [],
  });

  (useRouter() as any).query.automationId = 'bar';

  act(() => {
    root.update(<Automation />);
  });

  expect(root.root.findByType(AutomationBuilder).props.value).toEqual({
    name: 'World',
    do: [],
  });
});

it('should change url after changing slug', async () => {
  const root = renderer.create(<Automation />);
  const title = renderer.create(root.root.findByType(PageHeader).props.title);

  act(() => {
    title.root
      .findByType(EditDetails)
      .props.onSave({ slug: 'foofoo', name: 'foofoo', description: '' });
  });

  expect(root.root.findByType(AutomationBuilder).props.value).toEqual({
    name: 'foofoo',
    slug: 'foofoo',
    description: '',
    do: [],
  });

  await act(async () => {
    await true;
  });

  expect(useRouter().replace).toHaveBeenCalledWith(
    '/workspaces/42/automations/foofoo',
    undefined,
    {
      shallow: true,
    }
  );
});

it('should save', async () => {
  const root = renderer.create(<Automation />);

  act(() => {
    return;
  });

  await act(async () => {
    await root.root.findByType(PageHeader).props.extra[0].props.onClick();
  });

  expect(useWorkspace().updateAutomation).toHaveBeenCalled();
  expect(notification.success).toHaveBeenCalledWith;
});

it('should save on shortcut', async () => {
  const root = renderer.create(<Automation />);

  act(() => {
    return;
  });
  const e = { preventDefault: jest.fn() };
  expect(useKeyboardShortcut).toHaveBeenCalled();
  await act(async () => {
    await (useKeyboardShortcut as jest.Mock).mock.calls[0][0][0].command(e);
  });
  expect(e.preventDefault).toHaveBeenCalled();
  expect(useWorkspace().updateAutomation).toHaveBeenCalled();
});
