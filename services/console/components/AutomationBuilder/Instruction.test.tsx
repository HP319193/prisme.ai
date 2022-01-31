import Instruction from "./Instruction";
import renderer, { act } from "react-test-renderer";
import { useAutomationBuilder } from "./context";
import Block from "./Block";

jest.mock('./context', () => {
  const mock = {
    getApp: () => ({
      name: 'App',
      icon: '/icon.svg'
    })
  }
  return {
    useAutomationBuilder: () => mock
  }
})

jest.mock('react-flow-renderer', () => {
  return {
    Handle: () => <div>Handle</div>,
    Position: {
      Bottom: 'bottom',
      Top: 'top'
    }
  }
})

jest.mock('./Block', () => () => null)

it("should render", () => {
  const root = renderer.create(<Instruction id="a" data={{}} type="instruction" selected={false} isConnectable={false} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should edit", () => {
  useAutomationBuilder().editInstruction = jest.fn();
  const root = renderer.create(<Instruction id="a" data={{}} type="trigger" selected={false} isConnectable={false} />);

  act(() => {
    root.root.findByType(Block).props.onEdit({}, 1)
  })
  expect(useAutomationBuilder().editInstruction).toHaveBeenCalled()
});
