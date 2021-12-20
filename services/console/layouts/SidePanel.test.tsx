import SidePanel from "./SidePanel";
import renderer, { act } from "react-test-renderer";
import ClickAwayListener from "react-click-away-listener";

it("should render", () => {
  const root = renderer.create(<SidePanel sidebarOpen={false} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render opened", () => {
  const root = renderer.create(<SidePanel sidebarOpen />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should close", () => {
  const onClose = jest.fn();
  const root = renderer.create(<SidePanel sidebarOpen onClose={onClose} />);
  act(() => {
    root.root.findByType(ClickAwayListener).props.onClickAway();
  });
  expect(onClose).toHaveBeenCalled();
});

it("should close without crashing", () => {
  const root = renderer.create(<SidePanel sidebarOpen />);
  act(() => {
    root.root.findByType(ClickAwayListener).props.onClickAway();
  });
});
