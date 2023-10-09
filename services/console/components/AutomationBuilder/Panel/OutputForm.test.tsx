import OutputForm from './OutputForm';
import renderer from 'react-test-renderer';

jest.mock('../../SchemaForm/BlockSelector', () => {
  return () => null;
});
jest.mock('../../SchemaForm/SchemaForm', () => () => null);

it('should render', () => {
  const onChange = jest.fn();
  const root = renderer.create(
    <OutputForm output="output" onChange={onChange} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
