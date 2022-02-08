import SidePanel from './SidePanel';
import renderer from 'react-test-renderer';

it('should render', () => {
  const root = renderer.create(<SidePanel />);
  expect(root.toJSON()).toMatchSnapshot();
});
