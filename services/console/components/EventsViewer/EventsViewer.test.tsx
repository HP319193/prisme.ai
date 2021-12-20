import EventsViewer from "./EventsViewer";
import renderer from "react-test-renderer";

it("should render", () => {
  const root = renderer.create(<EventsViewer />);
  expect(root.toJSON()).toMatchSnapshot();
});
