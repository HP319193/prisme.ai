import WorkspaceLayout from "./WorkspaceLayout";
import { getLayout } from "./index";
import renderer, { act } from "react-test-renderer";
import { useRouter } from "next/router";
import { useWorkspaces } from "../../components/WorkspacesProvider";
import EditableTitle from "../../components/EditableTitle";
import { Button } from "primereact/button";
import AutomationsSidebar from "../../views/AutomationsSidebar";
import SidePanel from "../SidePanel";
import Events from "../../api/events";
import api from "../../api/api";
import { useWorkspace, WorkspaceContext } from "./context";
import { Event } from "../../api/types";

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

jest.mock("../../api/events", () => {
  class Events {
    static destroyMock = jest.fn();
    static listeners: any[] = []
    all(listener: Function) {
      Events.listeners.push(listener)
      return () => { }
    }
    destroy() {
      Events.destroyMock()
    }
  }
  return Events
})

beforeEach(() => {
  useRouter().query.id = "42";
  (useWorkspaces().get as any).mockImplementation((id: string) => {
    if (id === "42") {
      return {
        id: "42",
        name: "foo",
        automations: [],
      };
    }
    if (id === "43") {
      return {
        id: "43",
        name: "bar",
        automations: [],
      };
    }
    return null;
  });
});

it("should render empty", async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render loading", async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render 404", async () => {
  useRouter().query.id = "12";
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
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

it("should get layout", async () => {
  const root = renderer.create(getLayout(<div />));
  await act(async () => {
    await true;
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it("should update title", async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    root.root.findByType(EditableTitle).props.onChange("bar");
  });
  expect(useWorkspaces().update).toHaveBeenCalledWith({
    id: "42",
    name: "bar",
    automations: [],
  });
});

it("should display automations", async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    root.root.findAllByType(Button)[0].props.onClick();
    jest.runAllTimers();
  });
  expect(root.root.findByType(AutomationsSidebar)).toBeDefined();
});

xit("should display apps", async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    root.root.findAllByType(Button)[1].props.onClick();
    jest.runAllTimers();
  });

  expect(root.root.findAllByType(AutomationsSidebar)).toEqual([]);
});

xit("should display pages", async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    root.root.findAllByType(Button)[2].props.onClick();
    jest.runAllTimers();
  });

  expect(root.root.findAllByType(AutomationsSidebar)).toEqual([]);
});

it("should close sidepanel", async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    root.root.findByType(SidePanel).props.onClose();
  });
  expect(root.root.findByType(SidePanel).props.sidebarOpen).toBe(false);
});

it("should close automations sidepanel", async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    root.root.findByType(AutomationsSidebar).props.onClose();
  });
  expect(root.root.findByType(SidePanel).props.sidebarOpen).toBe(false);
});

it('should destroy socket', async () => {
  const root = renderer.create(<WorkspaceLayout>Foo</WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  expect((Events as any).destroyMock).not.toHaveBeenCalled();

  act(() => {
    useRouter().query.id = '43';
  })
  await act(async () => {
    root.update(<WorkspaceLayout>Foo</WorkspaceLayout>);
    await true;
  })
  expect((Events as any).destroyMock).toHaveBeenCalled();
});

it('should load events', async () => {
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  }
  jest.spyOn(api, 'getEvents').mockImplementation(async () => {
    return [{
      id: '1',
      createdAt: new Date('2012-01-01 12:12')
    }, {
      id: '2',
      createdAt: new Date('2012-01-03')
    }, {
      id: '3',
      createdAt: new Date('2012-01-01 16:12')
    }, {
      id: '4',
      createdAt: new Date('2012-01-01 01:12')
    }, {
      id: '5',
      createdAt: new Date('2012-01-02')
    }] as Event<Date>[]
  })
  const root = renderer.create(<WorkspaceLayout><Test /></WorkspaceLayout>);
  await act(async () => {
    await true;
  });

  expect(context.events).toEqual(new Map([
    [1325376000000, new Set([
      {
        id: '3',
        createdAt: new Date('2012-01-01 16:12')
      },
      {
        id: '1',
        createdAt: new Date('2012-01-01 12:12')
      },
      {
        id: '4',
        createdAt: new Date('2012-01-01 01:12')
      }
    ])],
    [1325548800000, new Set([{
      id: '2', createdAt: new Date('2012-01-03')
    }])],
    [1325462400000, new Set([{
      id: '5', createdAt: new Date('2012-01-02')
    }])],
  ]))
})

it('should listen to events on socket', async () => {
  jest.spyOn(api, 'getEvents').mockImplementation(async () => [])
  let context: WorkspaceContext = {} as WorkspaceContext;
  const Test = () => {
    context = useWorkspace();
    return null;
  }
  (Events as any).listeners = []
  const root = renderer.create(<WorkspaceLayout><Test /></WorkspaceLayout>);
  await act(async () => {
    await true;
  });
  act(() => {
    (Events as any).listeners.forEach((listener: Function) => {
      listener('apps.event', {
        createdAt: new Date('2021-01-01')
      })
    })
  })
  expect(context.events).toEqual(new Map([
    [1609459200000, new Set([{ createdAt: new Date('2021-01-01') }])]
  ]))

  act(() => {
    (Events as any).listeners.forEach((listener: Function) => {
      listener('apps.event', {
        createdAt: new Date('2021-01-02')
      })
    })
  })
  expect(context.events).toEqual(new Map([
    [1609459200000, new Set([{ createdAt: new Date('2021-01-01') }])],
    [1609545600000, new Set([{ createdAt: new Date('2021-01-02') }])],
  ]))
})
