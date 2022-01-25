import Automation from "./Automation";
import renderer from "react-test-renderer";
import { useRouter } from "next/router";
import getLayout from "../layouts/WorkspaceLayout";

jest.mock("../layouts/WorkspaceLayout", () => {
  const mock: any = jest.fn();
  mock.useWorkspace = () => ({
    workspace: {
      id: "42",
      automations: [
        {
          id: "43",
          name: "Hello",
        },
      ],
    },
  });
  return mock;
});
jest.mock("next/router", () => {
  const replace = jest.fn();
  return {
    useRouter: () => ({
      query: {
        automationId: "43",
      },
      replace,
    }),
  };
});

it("should render", () => {
  const root = renderer.create(<Automation />);
  expect(root.toJSON()).toMatchSnapshot();
});
