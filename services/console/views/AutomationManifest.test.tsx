import AutomationManifest from "./AutomationManifest";
import renderer from "react-test-renderer";
import { getLayout } from "../layouts/AutomationLayout";

jest.mock("../layouts/AutomationLayout", () => ({
  getLayout: jest.fn(),
}));

it("should render", () => {
  const root = renderer.create(<AutomationManifest />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should get layout", () => {
  AutomationManifest.getLayout(<div />);
  expect(getLayout).toHaveBeenCalled();
});
