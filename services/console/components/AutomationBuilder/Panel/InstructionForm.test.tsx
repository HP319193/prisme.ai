import InstructionForm from './InstructionForm';
import renderer, { act } from 'react-test-renderer';
import InstructionSelection from './InstructionSelection';
import InstructionValue from './InstructionValue';

jest.mock('@prisme.ai/design-system', () => {
  return {
    ListItem({ children = null }: any) {
      return children;
    },
    SearchInput({ children = null }: any) {
      return children;
    },
    Space({ children = null }: any) {
      return children;
    },
    Title({ children = null }: any) {
      return children;
    },
  };
});

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

it('should set instruction without params', () => {
  const onSubmit = jest.fn();
  const root = renderer.create(<InstructionForm onSubmit={onSubmit} />);

  act(() => {
    root.root.findByType(InstructionSelection).props.onSubmit('wait');
  });

  expect(onSubmit).toHaveBeenCalledWith({
    wait: undefined,
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

it('should set instruction with params', () => {
  const onSubmit = jest.fn();
  const root = renderer.create(<InstructionForm onSubmit={onSubmit} />);

  act(() => {
    root.root.findByType(InstructionSelection).props.onSubmit('emit');
  });

  expect(root.root.findByType(InstructionValue)).toBeDefined();

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
