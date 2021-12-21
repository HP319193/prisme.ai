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

jest.mock("primereact/tabmenu", () => ({
  TabMenu: () => null,
}));
jest.mock("../WorkspaceLayout", () => {
  const workspace = {
    id: "42",
    automations: {
      foo: {
        triggers: {
          events: [],
          do: "",
        },
        workflows: {},
      },
      foofoo: {
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
  const mock = {
    query: { name: "foo", id: "42" },
    route: "/workspaces/42/automations/foo/manifest",
    push: jest.fn(),
    replace: jest.fn(),
  };
  return {
    useRouter: () => mock,
  };
});

jest.mock("../../components/WorkspacesProvider", () => {
  const mock = {
    update: jest.fn(),
  };
  return {
    useWorkspaces: () => mock,
  };
});

beforeEach(() => {
  useWorkspace().workspace.automations = {
    foo: {
      triggers: {
        foo: {
          events: [],
          do: "",
        },
      },
      workflows: {},
    },
    foofoo: {
      triggers: {},
      workflows: {},
    },
  };
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

it("should navigate", () => {
  const root = renderer.create(<AutomationLayout>Foo</AutomationLayout>);
  act(() => {
    root.root.findAllByType(TabMenu)[0].props.model[0].command();
  });
  expect(useRouter().push).toHaveBeenCalledWith("/workspaces/42");
  (useRouter().push as any).mockClear();

  act(() => {
    root.root.findAllByType(TabMenu)[1].props.model[0].command();
  });
  expect(useRouter().push).toHaveBeenCalledWith(
    "/workspaces/42/automations/foo/design"
  );
  (useRouter().push as any).mockClear();

  act(() => {
    root.root.findAllByType(TabMenu)[1].props.model[1].command();
  });
  expect(useRouter().push).toHaveBeenCalledWith(
    "/workspaces/42/automations/foo/manifest"
  );
});

it("should edit title", async () => {
  const root = renderer.create(<AutomationLayout>Foo</AutomationLayout>);
  const itemRoot = renderer.create(
    root.root.findAllByType(TabMenu)[0].props.model[1].template()
  );
  expect(itemRoot.toJSON()).toMatchSnapshot();

  await act(async () => {
    await itemRoot.root.findByType(EditableTitle).props.onChange("foo");
  });

  expect(useWorkspaces().update).not.toHaveBeenCalled();
  expect(useRouter().replace).not.toHaveBeenCalled();

  await act(async () => {
    await itemRoot.root.findByType(EditableTitle).props.onChange("foofoo");
  });

  expect(useWorkspaces().update).not.toHaveBeenCalled();
  expect(useRouter().replace).not.toHaveBeenCalled();

  await act(async () => {
    await itemRoot.root.findByType(EditableTitle).props.onChange("bar");
  });

  expect(useWorkspaces().update).toHaveBeenCalledWith({
    id: "42",
    automations: {
      bar: {
        triggers: {
          foo: {
            events: [],
            do: "",
          },
        },
        workflows: {},
      },
      foofoo: {
        triggers: {},
        workflows: {},
      },
    },
  });
  expect(useRouter().replace).toHaveBeenCalledWith(
    "/workspaces/42/automations/bar/manifest"
  );
});

it("should get layout", () => {
  const root = renderer.create(getLayout(<div />));
  expect(root.toJSON()).toMatchSnapshot();
});

it("should set and reset automation", () => {
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

  const expectedAutomation = {
    triggers: {},
    workflows: {},
  };
  act(() => {
    context.setAutomation(expectedAutomation);
  });
  expect(context.automation).toEqual({
    name: "foo",
    value: expectedAutomation,
  });

  act(() => {
    context.reset();
  });

  expect(context.automation).toEqual({
    name: "foo",
    value: {
      triggers: {
        foo: {
          events: [],
          do: "",
        },
      },
      workflows: {},
    },
  });
});

it("should save automation", () => {
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

  act(() => {
    context.save();
  });
  expect(useWorkspaces().update).toHaveBeenCalledWith({
    id: "42",
    automations: {
      foo: {
        triggers: {
          foo: {
            events: [],
            do: "",
          },
        },
        workflows: {},
      },
      foofoo: {
        triggers: {},
        workflows: {},
      },
    },
  });
});

it("should save", () => {
  const root = renderer.create(<AutomationLayout>foo</AutomationLayout>);
  const itemRoot = renderer.create(
    root.root.findAllByType(TabMenu)[1].props.model[2].template()
  );
  act(() => {
    itemRoot.root.findByType(Button).props.onClick();
  });
  expect(useWorkspaces().update).toHaveBeenCalled();
});
