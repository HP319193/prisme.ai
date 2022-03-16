import InstructionForm from './InstructionForm';
import renderer, { act } from 'react-test-renderer';
import InstructionSelection from './InstructionSelection';
import InstructionValue from './InstructionValue';

jest.mock('../context', () => {
  const mock = {
    getSchema: (name: string) => {
      if (name === 'wait') return {};
      if (name === 'emit')
        return {
          properties: {},
        };
      if (name === 'conditions')
        return {
          type: 'object',
        };
      if (name === 'all')
        return {
          type: 'array',
        };
      return {};
    },
    instructionsSchemas: [],
  };
  return {
    useAutomationBuilder: () => mock,
  };
});

it('should render', () => {
  const onSubmit = jest.fn();
  const root = renderer.create(<InstructionForm onSubmit={onSubmit} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should set instruction without params', async () => {
  jest.useFakeTimers();
  const onSubmit = jest.fn();
  const root = renderer.create(<InstructionForm onSubmit={onSubmit} />);

  await act(async () => {
    await true;
    jest.runAllTimers();
  });

  act(() => {
    root.root.findByType(InstructionSelection).props.onSubmit('wait');
  });

  expect(onSubmit).toHaveBeenCalledWith({
    wait: {},
  });
  onSubmit.mockClear();

  act(() => {
    root.root.findByType(InstructionSelection).props.onSubmit('conditions');
  });

  expect(onSubmit).toHaveBeenCalledWith({
    conditions: {},
  });
  onSubmit.mockClear();

  act(() => {
    root.root.findByType(InstructionSelection).props.onSubmit('all');
  });

  expect(onSubmit).toHaveBeenCalledWith({
    all: [],
  });
});

it('should set instruction with params', async () => {
  jest.useFakeTimers();
  const onSubmit = jest.fn();
  const root = renderer.create(<InstructionForm onSubmit={onSubmit} />);

  await act(async () => {
    await true;
    jest.runAllTimers();
  });
  await act(async () => {
    await true;
    jest.runAllTimers();
  });

  await act(async () => {
    root.root.findByType(InstructionSelection).props.onSubmit('emit');
  });

  expect(root.root.findAllByType(InstructionSelection).length).toBe(0);

  act(() => {
    root.root.findByType(InstructionValue).props.onSubmit({
      foo: 'bar',
    });
  });
  expect(onSubmit).toHaveBeenCalledWith({
    emit: {
      foo: 'bar',
    },
  });
});
