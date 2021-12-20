import Provider from "./Provider";
import renderer, { act } from "react-test-renderer";
import api from "../../api/api";
import { useWorkspaces } from ".";
// @ts-ignore
import { setUser } from "../UserProvider";

jest.mock("../UserProvider", () => {
  let user: any;
  return {
    useUser: () => ({
      user,
    }),
    setUser(u: any) {
      user = u;
    },
  };
});

beforeEach(() => {
  jest.resetAllMocks();
});

it("should access context", async () => {
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  expect(context.workspaces).toEqual(new Map());
  expect(context.get).toBeInstanceOf(Function);
  expect(context.fetch).toBeInstanceOf(Function);
  expect(context.create).toBeInstanceOf(Function);
  expect(context.update).toBeInstanceOf(Function);
});

it("should fetch workspaces", async () => {
  jest.spyOn(api, "getWorkspaces").mockReturnValue(
    Promise.resolve([
      {
        id: "42",
        name: "workspace",
      },
    ] as any)
  );
  setUser({});
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await true;
  });
  expect(api.getWorkspaces).toHaveBeenCalled();
  expect(context.workspaces).toEqual(
    new Map([
      [
        "42",
        {
          id: "42",
          name: "workspace",
        },
      ],
    ])
  );
});

it("should not fetch workspaces", async () => {
  jest.spyOn(api, "getWorkspaces").mockReturnValue(
    Promise.resolve([
      {
        id: "42",
        name: "workspace",
      },
    ] as any)
  );
  setUser(null);
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await true;
  });
  expect(api.getWorkspaces).not.toHaveBeenCalled();
  expect(context.workspaces).toEqual(new Map());
});

it("should create a workspace", async () => {
  jest.spyOn(api, "getWorkspaces").mockReturnValue(Promise.resolve([]));
  jest.spyOn(api, "createWorkspace").mockReturnValue(
    Promise.resolve({
      id: "new",
      name: "new",
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    const expected = await context.create("new");
    expect(api.createWorkspace).toHaveBeenCalledWith("new");
    expect(expected).toEqual({
      id: "new",
      name: "new",
    });
  });
});

it("should create many workspace", async () => {
  jest.spyOn(api, "getWorkspaces").mockReturnValue(Promise.resolve([]));
  jest.spyOn(api, "createWorkspace").mockReturnValue(
    Promise.resolve({
      id: "new (1)",
      name: "new (1)",
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    context.workspaces.set("new", {
      name: "new",
    });
    const expected = await context.create("new");
    expect(api.createWorkspace).toHaveBeenCalledWith("new (1)");
    expect(expected).toEqual({
      id: "new (1)",
      name: "new (1)",
    });
  });
});

it("should fetch a workspace", async () => {
  jest.spyOn(api, "getWorkspaces").mockReturnValue(Promise.resolve([]));
  jest.spyOn(api, "getWorkspace").mockReturnValue(
    Promise.resolve({
      id: "42",
      name: "fourtytwo",
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    const expected = await context.fetch("42");
    expect(api.getWorkspace).toHaveBeenCalledWith("42");
    expect(expected).toEqual({
      id: "42",
      name: "fourtytwo",
    });
  });
});

it("should get a workspace", async () => {
  setUser({});
  jest.spyOn(api, "getWorkspaces").mockReturnValue(
    Promise.resolve([
      {
        id: "42",
        name: "fourtytwo",
      },
    ] as any)
  );
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await true;
  });
  const expected = context.get("42");
  expect(expected).toEqual({
    id: "42",
    name: "fourtytwo",
  });
});

it("should update a workspace", async () => {
  jest.spyOn(api, "getWorkspaces").mockReturnValue(Promise.resolve([]));
  jest.spyOn(api, "updateWorkspace").mockReturnValue(
    Promise.resolve({
      id: "42",
      name: "foo",
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    context.workspaces.set("42", {
      id: "42",
      name: "foo",
    });
    const expected = await context.update({
      id: "42",
      name: "foo",
    });
    expect(api.updateWorkspace).toHaveBeenCalledWith({
      id: "42",
      name: "foo",
    });
    expect(expected).toEqual({
      id: "42",
      name: "foo",
    });
  });
});

it("should fail to update a workspace", async () => {
  setUser({});
  jest.spyOn(api, "getWorkspaces").mockReturnValue(
    Promise.resolve([
      {
        id: "42",
        name: "foo",
      },
    ] as any)
  );
  jest.spyOn(api, "updateWorkspace").mockRejectedValue("fail");
  let context: any = {};
  const Test = () => {
    context = useWorkspaces();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await true;
  });
  await act(async () => {
    const expected = await context.update({
      id: "42",
      name: "foo",
    });
    expect(api.updateWorkspace).toHaveBeenCalledWith({
      id: "42",
      name: "foo",
    });
    expect(expected).toBeNull();
  });
});
