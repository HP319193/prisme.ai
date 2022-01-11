import AutomationsSidebar from "./AutomationsSidebar";
import renderer, { act } from "react-test-renderer";
import { useWorkspaces } from "../components/WorkspacesProvider";
import { Button } from "primereact/button";
import { useWorkspace } from "../layouts/WorkspaceLayout";
import { useRouter } from "next/router";

jest.mock("../components/WorkspacesProvider", () => {
  const createAutomation = jest.fn((w, automation) => ({
    id: `${w.id}-1`,
    ...automation,
  }));
  return {
    useWorkspaces: () => ({
      createAutomation,
    }),
  };
});
jest.mock("../layouts/WorkspaceLayout", () => {
  const workspace = {
    id: "42",
    automations: [
      {
        id: "43",
        name: "First",
        triggers: {},
        workflows: {},
      },
    ],
  };
  return {
    useWorkspace: () => ({
      workspace,
    }),
  };
});
jest.mock("next/router", () => {
  const push = jest.fn();
  return {
    useRouter: () => ({
      query: {
        id: "42",
        name: "foo",
      },
      push,
    }),
  };
});
it("should render", () => {
  const onClose = jest.fn();
  const root = renderer.create(<AutomationsSidebar onClose={onClose} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should create an automation", async () => {
  const onClose = jest.fn();
  const root = renderer.create(<AutomationsSidebar onClose={onClose} />);
  await act(async () => {
    await root.root.findByType(Button).props.onClick();
  });
  expect(useWorkspaces().createAutomation).toHaveBeenCalledWith(
    useWorkspace().workspace,
    {
      name: "automations.create.defaultName",
      triggers: {
        "automations.create.value.trigger": {
          do: "automations.create.value.workflow",
          events: ["automations.create.value.event"],
        },
      },
      workflows: {
        "automations.create.value.workflow": {
          do: [
            {
              emit: {
                event: "automations.create.value.event",
              },
            },
          ],
        },
      },
    }
  );
  expect(onClose).toHaveBeenCalled();
  expect(useRouter().push).toHaveBeenCalledWith(
    "/workspaces/42/automations/42-1/manifest"
  );
});
it("should create an automation with existing name", async () => {
  useWorkspace().workspace.automations = [
    {
      id: "44",
      name: "automations.create.defaultName",
      triggers: {},
      workflows: {},
    },
  ];
  const onClose = jest.fn();
  const root = renderer.create(<AutomationsSidebar onClose={onClose} />);
  await act(async () => {
    await root.root.findByType(Button).props.onClick();
  });
  expect(useWorkspaces().createAutomation).toHaveBeenCalledWith(
    useWorkspace().workspace,
    {
      name: "automations.create.defaultName (1)",
      triggers: {
        "automations.create.value.trigger": {
          do: "automations.create.value.workflow",
          events: ["automations.create.value.event"],
        },
      },
      workflows: {
        "automations.create.value.workflow": {
          do: [
            {
              emit: {
                event: "automations.create.value.event",
              },
            },
          ],
        },
      },
    }
  );
});
