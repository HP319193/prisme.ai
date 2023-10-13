import { Automation } from './Automation';
import renderer, { act } from 'react-test-renderer';
import AutomationBuilder from '../../components/AutomationBuilder';
import { useRouter } from 'next/router';
import useKeyboardShortcut from '../../components/useKeyboardShortcut';
import { notification } from '@prisme.ai/design-system';
import EditDetails from './EditDetails';
import { workspaceContext } from '../../providers/Workspace';
import { automationContext } from '../../providers/Automation';
import { workspaceLayoutContext } from '../../layouts/WorkspaceLayout/context';
import { PageHeader } from 'antd';
import { replaceSilently } from '../../utils/urls';

jest.useFakeTimers();

jest.mock(
  '../utils/useDirtyWarning',
  () =>
    function useDirtyWarning() {
      return [];
    }
);

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

jest.mock('../../components/useKeyboardShortcut', () => jest.fn());

jest.mock('../../components/AutomationBuilder', () => () => null);

jest.mock(
  '../../components/SourceEdit/SourceEdit',
  () =>
    function SourceEdit() {
      return null;
    }
);

jest.mock('../../utils/urls', () => ({
  replaceSilently: jest.fn(),
}));

beforeEach(() => {
  useRouter().query.automationId = 'foo';
});

const automationContextValue: any = {
  automation: {
    slug: 'foo',
    do: [],
  },
  saveAutomation: jest.fn(),
  saving: false,
  deleteAutomation: jest.fn(),
};

it('should render', () => {
  const root = renderer.create(
    <workspaceContext.Provider value={{ workspace: { id: '42' } } as any}>
      <workspaceLayoutContext.Provider value={{} as any}>
        <automationContext.Provider value={automationContextValue}>
          <Automation />
        </automationContext.Provider>
      </workspaceLayoutContext.Provider>
    </workspaceContext.Provider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render redirect', () => {
  useRouter().query.automationId = 'not found';
  const root = renderer.create(
    <workspaceContext.Provider value={{ workspace: { id: '42' } } as any}>
      <workspaceLayoutContext.Provider value={{} as any}>
        <automationContext.Provider value={automationContextValue}>
          <Automation />
        </automationContext.Provider>
      </workspaceLayoutContext.Provider>
    </workspaceContext.Provider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should change url after changing slug', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={{ workspace: { id: '42' } } as any}>
      <workspaceLayoutContext.Provider value={{} as any}>
        <automationContext.Provider value={automationContextValue}>
          <Automation />
        </automationContext.Provider>
      </workspaceLayoutContext.Provider>
    </workspaceContext.Provider>
  );
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

  expect(replaceSilently).toHaveBeenCalledWith(
    '/workspaces/42/automations/foofoo'
  );
});

it('should save', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={{ workspace: { id: '42' } } as any}>
      <workspaceLayoutContext.Provider value={{} as any}>
        <automationContext.Provider value={automationContextValue}>
          <Automation />
        </automationContext.Provider>
      </workspaceLayoutContext.Provider>
    </workspaceContext.Provider>
  );

  act(() => {
    return;
  });

  await act(async () => {
    await root.root.findByType(PageHeader).props.extra[0].props.onClick();
  });

  expect(automationContextValue.saveAutomation).toHaveBeenCalled();
  expect(notification.success).toHaveBeenCalledWith;
});

it('should save on shortcut', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={{ workspace: { id: '42' } } as any}>
      <workspaceLayoutContext.Provider value={{} as any}>
        <automationContext.Provider value={automationContextValue}>
          <Automation />
        </automationContext.Provider>
      </workspaceLayoutContext.Provider>
    </workspaceContext.Provider>
  );

  act(() => {
    return;
  });
  const e = { preventDefault: jest.fn() };
  expect(useKeyboardShortcut).toHaveBeenCalled();
  await act(async () => {
    await (useKeyboardShortcut as jest.Mock).mock.calls[0][0][0].command(e);
  });
  expect(e.preventDefault).toHaveBeenCalled();
  expect(automationContextValue.saveAutomation).toHaveBeenCalled();
});
