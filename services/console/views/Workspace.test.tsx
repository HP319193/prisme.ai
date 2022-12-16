import Workspace from './Workspace';
import renderer from 'react-test-renderer';
import WorkspaceProvider from '../providers/Workspace';

jest.mock('next/router', () => {
  const mock = { push: jest.fn() };
  return {
    useRouter: () => mock,
  };
});
jest.mock('../utils/useYaml', () => ({}));

jest.mock('../layouts/WorkspaceLayout', () => {
  const mock = {
    events: new Map(),
    filters: {},
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
  const root = renderer.create(
    <WorkspaceProvider id="42">
      <Workspace />
    </WorkspaceProvider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
