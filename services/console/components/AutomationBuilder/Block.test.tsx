import Block from './Block';
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
    getApp: () => ({
      name: 'Logical',
      icon: '/icon.svg',
    }),
    removeInstruction: jest.fn(),
  };
  return {
    useAutomationBuilder: () => mock,
  };
});

it('should render', () => {
  const root = renderer.create(
    <>
      <Block
        id="a"
        data={{ label: 'emit', value: { event: 'the event' } }}
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
      <Block
        id="a"
        data={{ label: 'repeat', value: { on: '$a', do: [] } }}
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
      <Block
        id="a"
        data={{ label: 'set', value: { name: 'foo', value: 'bar' } }}
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
      <Block
        id="a"
        data={{ label: 'delete', value: { name: 'foo' } }}
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
      <Block
        id="a"
        data={{ label: 'wait' }}
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
      <Block
        id="a"
        data={{ label: 'do something' }}
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
    </>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should remove instruction', () => {
  const parent: any = [];
  const root = renderer.create(
    <Block
      removable
      id="a"
      data={{ parent, index: 0, label: 'emit', value: { event: 'the event' } }}
      type="instruction"
      selected={false}
      isConnectable={false}
    />
  );

  act(() => {
    root.root
      .find((el) => el.props.className === 'pi pi-times-circle')
      .parent!.props.onClick();
  });
  expect(useAutomationBuilder().removeInstruction).toHaveBeenCalledWith(
    parent,
    0
  );
});
