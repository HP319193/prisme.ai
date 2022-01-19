import AutomationLayout from "./AutomationLayout";
import getLayout from "./index";
import renderer, { act } from "react-test-renderer";
import { useRouter } from "next/router";
import { TabMenu } from "primereact/tabmenu";
import EditableTitle from "../../components/EditableTitle";
import { useWorkspaces } from "../../components/WorkspacesProvider";
import { useAutomation } from "./context";
import { useWorkspace } from "../WorkspaceLayout";
import { Button } from "primereact/button";
import { useToaster } from "../Toaster";

jest.mock("primereact/tabmenu", () => ({
  TabMenu: () => null,
}));
jest.mock("../WorkspaceLayout", () => {
  const workspace = {
    id: "42",
  };
  return {
    useWorkspace: () => ({
      workspace,
    }),
  };
});

jest.mock("next/router", () => {
  const mock = {
    query: { id: "42", automationId: "43" },
    route: "/workspaces/42/automations/43/manifest",
    push: jest.fn(),
    replace: jest.fn(),
  };
  return {
    useRouter: () => mock,
  };
});

jest.mock("../../components/WorkspacesProvider", () => {
  const mock = {
    updateAutomation: jest.fn(),
  };
  return {
    useWorkspaces: () => mock,
  };
});

jest.mock("../Toaster", () => {
  const mock = {
    show: jest.fn(),
  };
  return { useToaster: () => mock };
});

beforeEach(() => {
  useWorkspace().workspace.automations = [
    {
      id: "43",
      name: "foo",
      triggers: {},
      workflows: {},
    },
    {
      id: "44",
      name: "foofoo",
      triggers: {},
      workflows: {},
    },
  ];
  (useWorkspaces().updateAutomation as jest.Mock).mockClear();
});

it("should render", () => {
  const root = renderer.create(<AutomationLayout>Foo</AutomationLayout>);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render with manifest tab active", () => {
  useRouter().route = "/workspaces/42/automations/foo/manifest";
  const root = renderer.create(<AutomationLayout>Foo</AutomationLayout>);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should navigate", async () => {
  const root = renderer.create(<AutomationLayout>Foo</AutomationLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    root.root.findAllByType(TabMenu)[0].props.model[0].command();
  });
  expect(useRouter().push).toHaveBeenCalledWith("/workspaces/42");
  (useRouter().push as any).mockClear();

  act(() => {
    root.root.findAllByType(TabMenu)[1].props.model[0].command();
  });
  expect(useRouter().push).toHaveBeenCalledWith(
    "/workspaces/42/automations/43/design"
  );
  (useRouter().push as any).mockClear();

  act(() => {
    root.root.findAllByType(TabMenu)[1].props.model[1].command();
  });
  expect(useRouter().push).toHaveBeenCalledWith(
    "/workspaces/42/automations/43/manifest"
  );
});

it("should edit title", async () => {
  const root = renderer.create(<AutomationLayout>Foo</AutomationLayout>);
  await act(async () => {
    await true;
  });
  const itemRoot = renderer.create(
    root.root.findAllByType(TabMenu)[0].props.model[1].template()
  );
  expect(itemRoot.toJSON()).toMatchSnapshot();

  await act(async () => {
    await itemRoot.root.findByType(EditableTitle).props.onChange("foo");
  });

  const { updateAutomation } = useWorkspaces();

  expect(updateAutomation).not.toHaveBeenCalled();

  await act(async () => {
    await itemRoot.root.findByType(EditableTitle).props.onChange("foofoo");
  });

  await act(async () => {
    await itemRoot.root.findByType(EditableTitle).props.onChange("bar");
  });
});

it("should get layout", async () => {
  const root = renderer.create(getLayout(<div />));
  await act(async () => {
    await true;
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it("should set and reset automation", async () => {
  let context: any;
  const Test = () => {
    context = useAutomation();
    return null;
  };
  const root = renderer.create(
    <AutomationLayout>
      <Test />
    </AutomationLayout>
  );
  await act(async () => {
    await true;
  });
  const expectedAutomation = {
    triggers: {},
    workflows: {
      something: {
        do: [
          {
            emit: {
              events: ["event"],
            },
          },
        ],
      },
    },
  };
  act(() => {
    context.setAutomation(expectedAutomation);
  });

  expect(context.automation).toEqual({
    id: "43",
    name: "foo",
    ...expectedAutomation,
  });

  act(() => {
    context.reset();
  });

  expect(context.automation).toEqual({
    id: "43",
    name: "foo",
    triggers: {},
    workflows: {},
  });
});

it("should save automation", async () => {
  let context: any;
  const Test = () => {
    context = useAutomation();
    return null;
  };
  const root = renderer.create(
    <AutomationLayout>
      <Test />
    </AutomationLayout>
  );
  await act(async () => {
    await true;
  });
  await act(async () => {
    await context.save();
  });
  expect(useWorkspaces().updateAutomation).toHaveBeenCalledWith(
    useWorkspace().workspace,
    {
      id: "43",
      name: "foo",
      triggers: {},
      workflows: {},
    }
  );
});

it("should save", async () => {
  const root = renderer.create(<AutomationLayout>foo</AutomationLayout>);
  await act(async () => {
    await true;
  });
  const itemRoot = renderer.create(
    root.root.findAllByType(TabMenu)[1].props.model[2].template()
  );
  await act(async () => {
    await itemRoot.root.findByType(Button).props.onClick();
  });
  expect(useWorkspaces().updateAutomation).toHaveBeenCalled();
});

it("should fail to save", async () => {
  const root = renderer.create(<AutomationLayout>foo</AutomationLayout>);
  await act(async () => {
    await true;
  });
  (useWorkspaces().updateAutomation as jest.Mock).mockImplementationOnce(() => {
    throw new Error();
  });
  const itemRoot = renderer.create(
    root.root.findAllByType(TabMenu)[1].props.model[2].template()
  );
  await act(async () => {
    await itemRoot.root.findByType(Button).props.onClick();
  });
  expect(useToaster().show).toHaveBeenCalled();
});
