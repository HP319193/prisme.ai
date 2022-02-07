import EmptyBlock from './EmptyBlock';
import renderer, { act } from 'react-test-renderer';
import { useAutomationBuilder } from './context';

jest.mock('react-flow-renderer', () => {
  return {
    Handle: () => <div>Handle</div>,
    Position: {
      Bottom: 'bottom',
      Top: 'top',
    },
  };
});

jest.mock('./context', () => {
  const mock = {
    addInstruction: jest.fn(),
  };
  return {
    useAutomationBuilder: () => mock,
  };
});

it('should render', () => {
  const root = renderer.create(
    <EmptyBlock
      id="a"
      data={{}}
      type="instruction"
      selected={false}
      isConnectable={false}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should add instruction', () => {
  const parent: any = [];
  const root = renderer.create(
    <EmptyBlock
      id="a"
      data={{
        parent,
        index: 0,
        withButton: true,
      }}
      type="instruction"
      selected={false}
      isConnectable={false}
    />
  );

  act(() => {
    root.root.findByType('button').props.onClick();
  });

  expect(useAutomationBuilder().addInstruction).toHaveBeenCalledWith(parent, 0);
});
