import ButtonLink from "./ButtonLink";
import renderer from "react-test-renderer";

jest.mock("next/link", () => {
  const Link = ({ children }: any) => <div className="Link">{children}</div>
  return Link
})
it("should render without link", () => {
  const root = renderer.create(<ButtonLink>Click</ButtonLink>);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render with link", () => {
  const root = renderer.create(<ButtonLink href="/foo">Click</ButtonLink>);
  expect(root.toJSON()).toMatchSnapshot();
});
