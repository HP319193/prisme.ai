import { Loading } from './Loading';
import renderer from 'react-test-renderer';

it('should render', () => {
  const root = renderer.create(<Loading />);
  expect(root.toJSON()).toMatchSnapshot();
});
