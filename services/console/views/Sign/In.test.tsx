import SignIn from "./In";
import renderer, { act } from "react-test-renderer";
import { useUser } from "../../components/UserProvider";
import ApiError from "../../api/ApiError";
import { Form } from "react-final-form";
import { useRouter } from "next/router";

jest.mock("../../components/UserProvider", () => {
  const mock: any = {};
  mock.mock = mock;
  return {
    useUser: () => mock,
  };
});
jest.mock("next/router", () => {
  const push = jest.fn();
  return {
    useRouter: () => ({
      push,
    }),
  };
});

beforeEach(() => {
  const { mock } = useUser() as any;
  mock.user = null;
  mock.loading = false;
  mock.error = null;
  mock.signin = jest.fn();
});

it("should render", () => {
  const root = renderer.create(<SignIn />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should load", () => {
  (useUser() as any).mock.loading = true;
  const root = renderer.create(<SignIn />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should have error", () => {
  (useUser() as any).mock.error = new ApiError(
    {
      error: "Error",
      message: "Error",
    },
    400
  );
  const root = renderer.create(<SignIn />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should submit form", async () => {
  const root = renderer.create(<SignIn />);
  await act(async () => {
    await root.root
      .findByType(Form)
      .props.onSubmit({ username: "email@company.com", password: "123456" });
  });
  expect(useUser().signin).toHaveBeenCalledWith("email@company.com", "123456");
});

it("should validate form", async () => {
  const root = renderer.create(<SignIn />);
  expect(
    root.root.findByType(Form).props.validate({ username: "", password: "" })
  ).toEqual({
    username: "required",
    password: "required",
  });
  expect(
    root.root.findByType(Form).props.validate({ username: "a", password: "" })
  ).toEqual({
    password: "required",
  });
  expect(
    root.root.findByType(Form).props.validate({ username: "", password: "a" })
  ).toEqual({
    username: "required",
  });
  expect(
    root.root.findByType(Form).props.validate({ username: "a", password: "a" })
  ).toEqual({});
});

it("should redirect after signin", () => {
  const root = renderer.create(<SignIn />);
  act(() => {
    (useUser() as any).mock.user = {};
    root.update(<SignIn />);
  });
  expect(useRouter().push).toHaveBeenCalledWith("/workspaces");
});
