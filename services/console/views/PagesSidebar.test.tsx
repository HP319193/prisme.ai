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

it('should render', () => {
  const root = renderer.create(<PagesSidebar />);
  expect(root.toJSON()).toMatchSnapshot();
});
