import AppsSidebar from './AppsSidebar';
import renderer from 'react-test-renderer';

it('should render', () => {
  const root = renderer.create(<AppsSidebar />);
  expect(root.toJSON()).toMatchSnapshot();
});
