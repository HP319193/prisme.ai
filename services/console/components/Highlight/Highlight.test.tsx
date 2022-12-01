import renderer from 'react-test-renderer';
import Highlight from './Highlight';

it('should render', () => {
  const root = renderer.create(<Highlight highlight="foo">Foo bar</Highlight>);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render with custom component', () => {
  const root = renderer.create(
    <Highlight highlight="e" component={<span className="custom-class" />}>
      Exemple
    </Highlight>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render with nothing', () => {
  const root = renderer.create(<Highlight>foo</Highlight>);
  expect(root.toJSON()).toMatchSnapshot();
});
