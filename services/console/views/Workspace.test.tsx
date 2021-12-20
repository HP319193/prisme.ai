import Workspace from "./Workspace";
import renderer from "react-test-renderer";

it("should render", () => {
  const root = renderer.create(<Workspace />);
  expect(root.toJSON()).toMatchSnapshot();
});
