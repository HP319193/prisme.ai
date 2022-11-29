import renderer from 'react-test-renderer';
import FadeScroll from './FadeScroll';

it('should render', () => {
  const root = renderer.create(
    <FadeScroll>
      <div>Foo</div>
      <div>Bar</div>
    </FadeScroll>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
