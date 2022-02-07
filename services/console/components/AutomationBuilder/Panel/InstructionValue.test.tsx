import InstructionValue from './InstructionValue';
import renderer from 'react-test-renderer';

it('should render', () => {
  const onSubmit = jest.fn();
  const root = renderer.create(
    <InstructionValue
      instruction="emit"
      schema={{ properties: { event: { type: 'string' } } }}
      value={{}}
      onSubmit={onSubmit}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should not render without schema', () => {
  const onSubmit = jest.fn();
  const root = renderer.create(
    <InstructionValue instruction="emit" value={{}} onSubmit={onSubmit} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
