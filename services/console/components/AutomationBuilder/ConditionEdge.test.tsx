import ConditionEdge from "./ConditionEdge";
import renderer from "react-test-renderer";
import { Position } from "react-flow-renderer";
import { useAutomationBuilder } from "./context";

jest.mock('./context', () => {
  const mock = {}
  return {
    useAutomationBuilder: () => mock
  }
})
it("should render", () => {
  const root = renderer.create(<ConditionEdge id="a" data={{}} source="b" target="c" sourcePosition={Position.Top} sourceX={0} sourceY={0} targetPosition={Position.Bottom} targetX={10} targetY={10} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render with parent", () => {
  const root = renderer.create(<ConditionEdge id="a" data={{
    parent: {}
  }} source="b" target="c" sourcePosition={Position.Top} sourceX={0} sourceY={0} targetPosition={Position.Bottom} targetX={10} targetY={10} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should add instruction", () => {
  const parent = {};
  useAutomationBuilder().editCondition = jest.fn();
  const root = renderer.create(<ConditionEdge id="a" data={{
    parent, key: '{{a}} == 1'
  }} source="b" target="c" sourcePosition={Position.Top} sourceX={0} sourceY={0} targetPosition={Position.Bottom} targetX={10} targetY={10} />);
  root.root.findByType('button').props.onClick();
  expect(useAutomationBuilder().editCondition).toHaveBeenCalledWith(parent, '{{a}} == 1');
});
