import InstructionSelection from './InstructionSelection';
import renderer, { act } from 'react-test-renderer';
import { useAutomationBuilder } from '../context';
import { SearchInput } from '@prisme.ai/design-system';

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
  const mock = {};
  return {
    useAutomationBuilder: () => mock,
  };
});

beforeEach(() => {
  useAutomationBuilder().instructionsSchemas = [
    ['logical', { emit: {}, wait: {} }, { icon: '/icon' }],
    ['workspace', { kermit: {}, waitress: {} }, { icon: '/icon' }],
  ];
});

it('should render', () => {
  const onSubmit = jest.fn();
  const root = renderer.create(<InstructionSelection onSubmit={onSubmit} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should filter', () => {
  const onSubmit = jest.fn();
  const root = renderer.create(<InstructionSelection onSubmit={onSubmit} />);

  act(() => {
    root.root
      .findByType(SearchInput)
      .props.onChange({ target: { value: 'ait' } });
  });

  expect(root.toJSON()).toMatchSnapshot();
});
