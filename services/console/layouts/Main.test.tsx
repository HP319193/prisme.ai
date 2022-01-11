import Main from "./Main";
import renderer from "react-test-renderer";
import { useUser } from "../components/UserProvider";

jest.mock("../components/UserProvider", () => {
  const mock = { user: undefined, loading: true, signout: jest.fn() };
  return {
    useUser: () => mock,
  };
});

it("should render loading", () => {
  const root = renderer.create(<Main />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render", () => {
  useUser().user = {
    firstName: "",
  };
  useUser().loading = false;
  const root = renderer.create(<Main />);
  expect(root.toJSON()).toMatchSnapshot();
});
