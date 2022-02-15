import PagesSidebar from './PagesSidebar';
import renderer from 'react-test-renderer';

it('should render', () => {
  const root = renderer.create(<PagesSidebar />);
  expect(root.toJSON()).toMatchSnapshot();
});
