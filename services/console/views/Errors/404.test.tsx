import Error404 from './404';
import renderer from 'react-test-renderer';

it('should render', () => {
  const root = renderer.create(<Error404 />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render with a link', () => {
  const root = renderer.create(<Error404 link="https://prisme.ai" />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render with a reason', () => {
  const root = renderer.create(<Error404 reason="why not" />);
  expect(root.toJSON()).toMatchSnapshot();
});
