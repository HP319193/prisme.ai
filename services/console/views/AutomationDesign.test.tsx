import AutomationDesign from "./AutomationDesign";
import renderer from "react-test-renderer";
import getLayout from "../layouts/AutomationLayout";

jest.mock("../layouts/AutomationLayout", () => jest.fn());

it("should render", () => {
  const root = renderer.create(<AutomationDesign />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should get layout", () => {
  AutomationDesign.getLayout(<div />);
  expect(getLayout).toHaveBeenCalled();
});
