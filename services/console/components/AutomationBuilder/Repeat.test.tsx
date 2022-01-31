import Repeat from "./Repeat";
import renderer from "react-test-renderer";

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

it("should render", () => {
  const root = renderer.create(<Repeat id="a" data={{}} type="instruction" selected={false} isConnectable={false} />);
  expect(root.toJSON()).toMatchSnapshot();
});
