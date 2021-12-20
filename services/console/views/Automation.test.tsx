import Automation from "./Automation";
import renderer from "react-test-renderer";
import { useRouter } from "next/router";
import getLayout from "../layouts/WorkspaceLayout";

jest.mock("../layouts/WorkspaceLayout", () => {
  const mock: any = jest.fn();
  mock.useWorkspace = () => ({
    workspace: {
      id: "42",
    },
  });
  return mock;
});
jest.mock("next/router", () => {
  const replace = jest.fn();
  return {
    useRouter: () => ({
      query: {
        id: "42",
        name: "foo",
      },
      replace,
    }),
  };
});

it("should render", () => {
  const root = renderer.create(<Automation />);
  expect(root.toJSON()).toMatchSnapshot();
  expect(useRouter().replace).toHaveBeenCalledWith(
    "/workspaces/42/automations/foo/manifest"
  );
});

it("should have workspaces layout", () => {
  const a = Automation.getLayout(<div />);
  expect(getLayout).toHaveBeenCalled();
});
