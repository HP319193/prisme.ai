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
    username: "user@fake.com",
    password: "password",
  });
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
    automations: {},
    createdAt: "",
    updatedAt: "",
  });
  expect(api.patch).toHaveBeenCalledWith("/workspaces/42", {
    id: "42",
    name: "foo",
    automations: {},
    createdAt: "",
    updatedAt: "",
  });
});
