import Workspace from './Workspace';
import renderer, { act } from 'react-test-renderer';
import WorkspaceSource from './WorkspaceSource';
import { useWorkspace } from '../layouts/WorkspaceLayout';

jest.mock('next/router', () => {
  const mock = { push: jest.fn() };
  return {
    useRouter: () => mock,
  };
});
jest.mock('../utils/useYaml', () => ({}));

jest.mock('../layouts/WorkspaceLayout', () => {
  const mock = {
    events: 'loading',
    displaySource: false,
    workspace: { id: '42', name: 'Foo' },
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
