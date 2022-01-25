import Workspace from "./Workspace";
import renderer from "react-test-renderer";

jest.mock("../utils/useYaml", () => ({}));

it("should render", () => {
  const root = renderer.create(<Workspace />);
  expect(root.toJSON()).toMatchSnapshot();
});
