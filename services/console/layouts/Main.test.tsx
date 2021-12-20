import Main from "./Main";
import renderer from "react-test-renderer";

it("should render", () => {
  const root = renderer.create(<Main />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render with custom header", () => {
  const root = renderer.create(
    <Main header={() => <div>Custom header</div>} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
