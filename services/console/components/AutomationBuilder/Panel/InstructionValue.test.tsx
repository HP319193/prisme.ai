import InstructionValue from './InstructionValue';
import renderer from 'react-test-renderer';

jest.mock('../../../utils/useYaml', () => {
  const toJSON = jest.fn();
  const toYaml = jest.fn();
  const useYaml = jest.fn(() => ({
    toJSON,
    toYaml,
  }));
  return useYaml;
});

it('should render', () => {
  const onChange = jest.fn();
  const root = renderer.create(
    <InstructionValue
      instruction="emit"
      schema={{ properties: { event: { type: 'string' } } }}
      value={{}}
      onChange={onChange}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should not render without schema', () => {
  const onChange = jest.fn();
  const root = renderer.create(
    <InstructionValue instruction="emit" value={{}} onChange={onChange} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
