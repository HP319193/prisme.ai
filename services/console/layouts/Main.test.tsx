import Main from "./Main";
import renderer from "react-test-renderer";

it("should render", () => {
  const root = renderer.create(<Main />);
  expect(root.toJSON()).toMatchSnapshot();
});
