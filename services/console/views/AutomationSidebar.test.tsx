import AutomationsSidebar from "./AutomationsSidebar";
import renderer, { act } from "react-test-renderer";
import { useWorkspaces } from "../components/WorkspacesProvider";
import { Button } from "primereact/button";
import { useWorkspace } from "../layouts/WorkspaceLayout";

jest.mock("../components/WorkspacesProvider", () => {
  const update = jest.fn();
  return {
    useWorkspaces: () => ({
      update,
    }),
  };
});
jest.mock("../layouts/WorkspaceLayout", () => {
  const workspace = {
    id: "42",
    automations: {
      First: {
        triggers: {},
        workflows: {},
      },
    },
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
  expect(useWorkspaces().update).toHaveBeenCalledWith({
    ...useWorkspace().workspace,
    automations: {
      ...useWorkspace().workspace.automations,
      ["automations.create.defaultName"]: {
        triggers: {
          "automations.create.value.trigger": {
            do: "",
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
      },
    },
  });
  expect(onClose).toHaveBeenCalled();
});
it("should create an automation with existing name", async () => {
  useWorkspace().workspace.automations["automations.create.defaultName"] = {
    triggers: {},
    workflows: {},
  };
  const onClose = jest.fn();
  const root = renderer.create(<AutomationsSidebar onClose={onClose} />);
  await act(async () => {
    await root.root.findByType(Button).props.onClick();
  });
  expect(useWorkspaces().update).toHaveBeenCalledWith({
    ...useWorkspace().workspace,
    automations: {
      ...useWorkspace().workspace.automations,
      ["automations.create.defaultName"]: {
        triggers: {},
        workflows: {},
      },
      ["automations.create.defaultName (1)"]: {
        triggers: {
          "automations.create.value.trigger": {
            do: "",
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
      },
    },
  });
});
