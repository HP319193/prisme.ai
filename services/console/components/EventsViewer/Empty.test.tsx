import renderer from 'react-test-renderer';
import EmptyWorkspace from './Empty';

it('should render', () => {
  const root = renderer.create(<EmptyWorkspace />);
  expect(root.toJSON()).toMatchSnapshot();
});
