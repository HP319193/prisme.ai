import Workspaces from "./workspaces";
import "@prisme.ai/types";

jest.mock("nanoid", () => ({ nanoid: () => "123456" }));

it("should call DSULStorage", async () => {
  const workspace: Prismeai.Workspace = {
    name: "nameWorkspace",
    id: "123456",
  };
  const mockedStorage: any = { save: jest.fn() };
  const mockedBroker: any = { send: jest.fn() };
  const workspaceCrud = new Workspaces(mockedBroker, mockedStorage);

  const result = await workspaceCrud.createWorkspace(workspace);

  expect(result).toBe(workspace);
  expect(mockedStorage.save).toHaveBeenCalledWith("123456", workspace);
  expect(mockedBroker.send).toHaveBeenCalledWith("workspaces.created", {
    workspace,
  });
});
