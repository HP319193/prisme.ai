import Edge from "./Edge";
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
  const root = renderer.create(<Edge id="a" data={{}} source="b" target="c" sourcePosition={Position.Top} sourceX={0} sourceY={0} targetPosition={Position.Bottom} targetX={10} targetY={10} />);
  expect(root.toJSON()).toMatchSnapshot();
});
