import { DownIcon } from './DownIcon';
import renderer from 'react-test-renderer';

it('should render', () => {
  const root = renderer.create(<DownIcon className="foo" />);
  expect(root.toJSON()).toMatchSnapshot();
});
