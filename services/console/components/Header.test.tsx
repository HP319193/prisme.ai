import Header from "./Header";
import renderer from "react-test-renderer";

it("should render", () => {
  const root = renderer.create(<Header />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render left content", () => {
  const root = renderer.create(
    <Header leftContent={<div>Left content</div>} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render right content", () => {
  const root = renderer.create(
    <Header rightContent={<div>Right content</div>} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render both", () => {
  const root = renderer.create(
    <Header
      leftContent={<div>Left content</div>}
      rightContent={<div>Right content</div>}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
