import PagesSidebar from './PagesSidebar';
import renderer from 'react-test-renderer';

jest.mock('./WorkspaceSource', () => () => null);
jest.mock('next/router', () => {
  const mock = {
    push: jest.fn(),
  };
  return {
    useRouter: () => mock,
  };
});
jest.mock('../components/WorkspacesProvider', () => {
  const mock = {
    createPage: jest.fn(),
  };
  return {
    useWorkspaces: () => mock,
  };
});

it('should render', () => {
  const root = renderer.create(<PagesSidebar />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should generate name', () => {
  const root = renderer.create(<PagesSidebar />);
});
