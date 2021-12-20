import CardsContainer from "./CardsContainer";
import renderer from "react-test-renderer";

it("should render", () => {
  const root = renderer.create(<CardsContainer />);
  expect(root.toJSON()).toMatchSnapshot();
});
