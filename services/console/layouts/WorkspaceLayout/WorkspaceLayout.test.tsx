import WorkspaceLayout from "./WorkspaceLayout";
import { getLayout } from "./index";
import renderer, { act } from "react-test-renderer";
import { useRouter } from "next/router";
import { useWorkspaces } from "../../components/WorkspacesProvider";
import EditableTitle from "../../components/EditableTitle";
import { Button } from "primereact/button";
import AutomationsSidebar from "../../views/AutomationsSidebar";
import SidePanel from "../SidePanel";

jest.useFakeTimers();

jest.mock("../../components/WorkspacesProvider", () => {
  const get = jest.fn();
  const fetch = jest.fn();
  const update = jest.fn();
  return {
    useWorkspaces: () => ({
      get,
      fetch,
      update,
    }),
  };
});

jest.mock("next/router", () => {
  const query = { id: "42" };
  const mock = {
    query,
  };
  return {
    useRouter: () => mock,
  };
});

beforeEach(() => {
  useRouter().query.id = "42";
  (useWorkspaces().get as any).mockImplementation((id: string) => {
    if (id === "42") {
      return {
        id: "42",
        name: "foo",
        automations: {},
      };
    }
    return null;
  });
});

it("should render empty", () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render loading", () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  act(() => {
    root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render 404", () => {
  useRouter().query.id = "12";
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);

  act(() => {
    root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render fetching", async () => {
  (useWorkspaces().get as any).mockImplementation(() => undefined);
  (useWorkspaces().fetch as any).mockImplementation(() => ({
    id: "42",
    name: "foo",
    automations: [],
  }));
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it("should get layout", () => {
  const root = renderer.create(getLayout(<div />));
  expect(root.toJSON()).toMatchSnapshot();
});

it("should update title", () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  act(() => {
    root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
  });
  act(() => {
    root.root.findByType(EditableTitle).props.onChange("bar");
  });
  expect(useWorkspaces().update).toHaveBeenCalledWith({
    id: "42",
    name: "bar",
    automations: {},
  });
});

it("should display automations", () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  act(() => {
    root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
  });
  act(() => {
    root.root.findAllByType(Button)[0].props.onClick();
    jest.runAllTimers();
  });
  expect(root.root.findByType(AutomationsSidebar)).toBeDefined();
});

xit("should display apps", () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  act(() => {
    root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
  });
  act(() => {
    root.root.findAllByType(Button)[1].props.onClick();
    jest.runAllTimers();
  });

  expect(root.root.findAllByType(AutomationsSidebar)).toEqual([]);
});

xit("should display pages", () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  act(() => {
    root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
  });
  act(() => {
    root.root.findAllByType(Button)[2].props.onClick();
    jest.runAllTimers();
  });

  expect(root.root.findAllByType(AutomationsSidebar)).toEqual([]);
});

it("should close sidepanel", () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  act(() => {
    root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
  });
  act(() => {
    root.root.findByType(SidePanel).props.onClose();
  });
  expect(root.root.findByType(SidePanel).props.sidebarOpen).toBe(false);
});

it("should close automations sidepanel", () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  act(() => {
    root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
  });
  act(() => {
    root.root.findByType(AutomationsSidebar).props.onClose();
  });
  expect(root.root.findByType(SidePanel).props.sidebarOpen).toBe(false);
});
