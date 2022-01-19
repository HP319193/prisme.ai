import api, { Api } from "./api";

it("should export an instance", () => {
  expect(api).toBeInstanceOf(Api);
});

it("should call /me", () => {
  const api = new Api("/fake/");
  api.get = jest.fn();
  api.me();
  expect(api.get).toHaveBeenCalledWith("/me");
});

it("should call /signin", () => {
  const api = new Api("/fake/");
  api.post = jest.fn();
  api.signin("user@fake.com", "password");
  expect(api.post).toHaveBeenCalledWith("/login", {
    email: "user@fake.com",
    password: "password",
  });
});

it("should call /signup", () => {
  const api = new Api("/fake/");
  api.post = jest.fn();
  api.signup("user@fake.com", "password", "firstname", "lastname");
  expect(api.post).toHaveBeenCalledWith("/signup", {
    email: "user@fake.com",
    password: "password",
    firstName: "firstname",
    lastName: "lastname",
  });
});

it("should call /signout", () => {
  const api = new Api("/fake/");
  api.post = jest.fn();
  api.signout();
  expect(api.post).toHaveBeenCalledWith("/logout");
  expect(api.token).toBeUndefined();
});

it("should call get /workspaces", () => {
  const api = new Api("/fake/");
  api.get = jest.fn();
  api.getWorkspaces();
  expect(api.get).toHaveBeenCalledWith("/workspaces");
});

it("should call get /workspaces/42", () => {
  const api = new Api("/fake/");
  api.get = jest.fn();
  api.getWorkspace("42");
  expect(api.get).toHaveBeenCalledWith("/workspaces/42");
});

it("should call post /workspaces", () => {
  const api = new Api("/fake/");
  api.post = jest.fn();
  api.createWorkspace("foo");
  expect(api.post).toHaveBeenCalledWith("/workspaces", {
    name: "foo",
  });
});

it("should call patch /workspaces/42", () => {
  const api = new Api("/fake/");
  api.patch = jest.fn();
  api.updateWorkspace({
    id: "42",
    name: "foo",
    automations: [],
    createdAt: "",
    updatedAt: "",
  });
  expect(api.patch).toHaveBeenCalledWith("/workspaces/42", {
    id: "42",
    name: "foo",
    automations: [],
    createdAt: "",
    updatedAt: "",
  });
});

it("should call post /workspaces/42/automations", () => {
  const api = new Api("/fake/");
  api.post = jest.fn();
  api.createAutomation(
    {
      id: "42",
      name: "foo",
      automations: [],
      createdAt: "",
      updatedAt: "",
    },
    {
      name: "foo",
      workflows: {},
    }
  );
  expect(api.post).toHaveBeenCalledWith("/workspaces/42/automations", {
    name: "foo",
    workflows: {},
  });
});

it("should call patch /workspaces/42/automations", () => {
  const api = new Api("/fake/");
  api.patch = jest.fn();
  api.updateAutomation(
    {
      id: "42",
      name: "foo",
      automations: [],
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "42-1",
      name: "foo",
      workflows: {},
    }
  );
  expect(api.patch).toHaveBeenCalledWith("/workspaces/42/automations/42-1", {
    id: "42-1",
    name: "foo",
    workflows: {},
  });
});

it("should call delete /workspaces/42/automations/42-1", () => {
  const api = new Api("/fake/");
  api.delete = jest.fn();
  api.deleteAutomation(
    {
      id: "42",
      name: "foo",
      automations: [],
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "42-1",
      name: "foo",
      workflows: {},
    }
  );
  expect(api.delete).toHaveBeenCalledWith("/workspaces/42/automations/42-1");
});

it('should call get /workspaces/42/events', async () => {
  const api = new Api("/fake/");
  api.get = jest.fn(async (): Promise<any> => ({
    result: {
      events: [{
        id: '1',
        createdAt: '2021-01-01'
      }]
    }
  }));
  expect(await api.getEvents('42')).toEqual([{
    id: '1',
    createdAt: new Date('2021-01-01')
  }])
})
