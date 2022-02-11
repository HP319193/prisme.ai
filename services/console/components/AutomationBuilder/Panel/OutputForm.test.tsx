import OutputForm from './OutputForm';
import renderer from 'react-test-renderer';

it('should render', () => {
  const onSubmit = jest.fn();
  const root = renderer.create(
    <OutputForm output="output" onSubmit={onSubmit} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
