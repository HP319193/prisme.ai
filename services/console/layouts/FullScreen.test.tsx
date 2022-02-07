import FullScreen from './FullScreen';
import renderer from 'react-test-renderer';

it('should render', () => {
  const root = renderer.create(<FullScreen />);
  expect(root.toJSON()).toMatchSnapshot();
});
