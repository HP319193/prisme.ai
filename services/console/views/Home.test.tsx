import Home from "./Home";
import renderer from "react-test-renderer";

it("should render", () => {
  const root = renderer.create(<Home />);
  expect(root.toJSON()).toMatchSnapshot();
});
