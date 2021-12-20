import AutomationLayout, { getLayout } from "./AutomationLayout";
import renderer, { act } from "react-test-renderer";
import { useRouter } from "next/router";
import { TabMenu } from "primereact/tabmenu";

jest.mock("primereact/tabmenu", () => ({
  TabMenu: () => null,
}));
jest.mock("./WorkspaceLayout", () => ({
  useWorkspace: () => ({
    workspace: {
      id: "42",
      automations: {
        foo: {
          triggers: [],
          workflows: [],
        },
      },
    },
  }),
}));

jest.mock("next/router", () => {
  const mock = {
    query: { name: "foo", id: "42" },
    route: "/workspaces/42/automations/foo/design",
    push: jest.fn(),
  };
  return {
    useRouter: () => mock,
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

it("should edit title", () => {
  const root = renderer.create(<AutomationLayout>Foo</AutomationLayout>);
  const itemRoot = renderer.create(
    root.root.findAllByType(TabMenu)[0].props.model[1].template()
  );
  expect(itemRoot.toJSON()).toMatchSnapshot();
});

it("should get layout", () => {
  const root = renderer.create(getLayout(<div />));
  expect(root.toJSON()).toMatchSnapshot();
});
