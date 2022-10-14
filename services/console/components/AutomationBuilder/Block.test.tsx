import Block from './Block';
import renderer, { act } from 'react-test-renderer';
import { useAutomationBuilder } from './context';
import { DeleteOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';

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
        displayAs="instruction"
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
      <Block
        id="a"
        data={{ label: 'repeat', value: { on: '$a', do: [] } }}
        displayAs="instruction"
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
      <Block
        id="a"
        data={{ label: 'set', value: { name: 'foo', value: 'bar' } }}
        displayAs="instruction"
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
      <Block
        id="a"
        data={{ label: 'delete', value: { name: 'foo' } }}
        displayAs="instruction"
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
      <Block
        id="a"
        data={{ label: 'wait' }}
        displayAs="instruction"
        type="instruction"
        selected={false}
        isConnectable={false}
      />
      );
      <Block
        id="a"
        data={{ label: 'do something' }}
        displayAs="instruction"
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
      displayAs="instruction"
      type="instruction"
      selected={false}
      isConnectable={false}
    />
  );

  act(() => {
    root.root.findByType(Popconfirm).props.onConfirm();
  });
  expect(useAutomationBuilder().removeInstruction).toHaveBeenCalledWith(
    parent,
    0
  );
});
