import Home from './Home';
import renderer from 'react-test-renderer';

jest.mock('next/router', () => {
  const mock = {
    replace: () => null,
  };
  return {
    useRouter: () => mock,
  };
});

it('should render', () => {
  const root = renderer.create(<Home />);
  expect(root.toJSON()).toMatchSnapshot();
});
