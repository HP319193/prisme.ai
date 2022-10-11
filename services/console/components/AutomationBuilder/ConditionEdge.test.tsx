import ConditionEdge from './ConditionEdge';
import renderer from 'react-test-renderer';
import { Position } from 'react-flow-renderer';
import { useAutomationBuilder } from './context';
import { Popconfirm } from 'antd';

jest.mock('./context', () => {
  const mock = {
    editCondition: jest.fn(),
    removeCondition: jest.fn(),
  };
  return {
    useAutomationBuilder: () => mock,
  };
});
it('should render', () => {
  const root = renderer.create(
    <ConditionEdge
      id="a"
      data={{}}
      source="b"
      target="c"
      sourcePosition={Position.Top}
      sourceX={0}
      sourceY={0}
      targetPosition={Position.Bottom}
      targetX={10}
      targetY={10}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render with parent', () => {
  const root = renderer.create(
    <ConditionEdge
      id="a"
      data={{
        parent: {},
      }}
      source="b"
      target="c"
      sourcePosition={Position.Top}
      sourceX={0}
      sourceY={0}
      targetPosition={Position.Bottom}
      targetX={10}
      targetY={10}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should add instruction', () => {
  const parent = {};
  useAutomationBuilder().editCondition = jest.fn();
  const root = renderer.create(
    <ConditionEdge
      id="a"
      data={{
        parent,
        key: '{{a}} == 1',
      }}
      source="b"
      target="c"
      sourcePosition={Position.Top}
      sourceX={0}
      sourceY={0}
      targetPosition={Position.Bottom}
      targetX={10}
      targetY={10}
    />
  );
  root.root.findAllByType('button')[0].props.onClick();
  expect(useAutomationBuilder().editCondition).toHaveBeenCalledWith(
    parent,
    '{{a}} == 1'
  );
});

it('should delete condition', () => {
  const parent = {};
  useAutomationBuilder().editCondition = jest.fn();
  const root = renderer.create(
    <ConditionEdge
      id="a"
      data={{
        parent,
        key: '{{a}} == 1',
      }}
      source="b"
      target="c"
      sourcePosition={Position.Top}
      sourceX={0}
      sourceY={0}
      targetPosition={Position.Bottom}
      targetX={10}
      targetY={10}
    />
  );
  root.root.findByType(Popconfirm).props.onConfirm();
  expect(useAutomationBuilder().removeCondition).toHaveBeenCalledWith(
    parent,
    '{{a}} == 1'
  );
});
