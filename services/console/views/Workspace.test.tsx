import Workspace from './Workspace';
import renderer, { act } from 'react-test-renderer';
import WorkspaceSource from './WorkspaceSource';
import { useWorkspace } from '../layouts/WorkspaceLayout';

jest.mock('../utils/useYaml', () => ({}));

jest.mock('../layouts/WorkspaceLayout', () => {
  const mock = {
    events: 'loading',
    displaySource: false,
  };
  return {
    useWorkspace: () => mock,
  };
});

jest.mock('./WorkspaceSource', () => {
  const WorkspaceSource = () => null;
  return WorkspaceSource;
});

it('should render', () => {
  const root = renderer.create(<Workspace />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should display source after mount', async () => {
  jest.useFakeTimers();
  const root = renderer.create(<Workspace />);
  expect(root.root.findAllByType('div')[0].props.className).toContain(
    '-translate-y-100'
  );
  expect(() => root.root.findByType(WorkspaceSource)).toThrow();

  act(() => {
    (useWorkspace() as any).displaySource = true;
  });

  act(() => {
    jest.runAllTimers();
  });
  await act(async () => {
    await root.update(<Workspace />);
  });

  expect(root.root.findByType(WorkspaceSource)).toBeDefined();

  act(() => {
    root.root.findByType(WorkspaceSource).props.onLoad();
  });
  expect(root.root.findAllByType('div')[0].props.className).not.toContain(
    '-translate-y-100'
  );
});
