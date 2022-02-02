import Toaster from './Toaster';
import renderer from 'react-test-renderer';

it('should render', () => {
  const root = renderer.create(<Toaster />);
  expect(root.toJSON()).toMatchSnapshot();
});
