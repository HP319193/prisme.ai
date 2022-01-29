import mongoose from "mongoose";
import { AccessManager, BaseSubject } from "..";
import abacWithRoles, { Role } from "../examples/abacWithRoles";

enum ActionType {
  Manage = "manage", // Super admin : permits every action
  ManageCollaborators = "manage_collaborators",
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
}

enum SubjectType {
  User = "user",
  Workspace = "workspace",
  Page = "page",
  Event = "event",
}

type SubjectInterfaces = {
  [SubjectType.User]: { id: string; firstName: string };
  [SubjectType.Workspace]: { id: string; name: string };
  [SubjectType.Page]: {
    name: string;
    id: string;
    public: boolean;
    workspaceId: string;
  };
  [SubjectType.Event]: { id: string };
};

const accessManager = new AccessManager<SubjectType, SubjectInterfaces>(
  {
    storage: {
      host: "mongodb://nas:27017/testCASL",
    },
    schemas: {
      user: new mongoose.Schema({}),
      workspace: new mongoose.Schema({
        name: String,
      }),
      page: new mongoose.Schema({
        name: String,
        workspaceId: { type: String, index: true },
        public: Boolean,
      }),
      event: new mongoose.Schema({}),
    },
  },
  abacWithRoles
);

beforeAll(async () => {
  await accessManager.start();
});

const adminA = accessManager.as({
  id: "adminUserIdA",
  role: Role.WorkspaceBuilder,
});

const adminB = accessManager.as({
  id: "adminUserIdB",
  role: Role.WorkspaceBuilder,
});

describe("CRUD with a predefined role", () => {
  let createdWorkspace: SubjectInterfaces[SubjectType.Workspace] & BaseSubject;
  it("A created object is automatically initialized with base fields", async () => {
    const workspace = await adminA.create(SubjectType.Workspace, {
      name: "workspaceName",
    });
    expect(workspace.createdBy).toEqual(adminA.user.id);
    expect(workspace.updatedBy).toEqual(adminA.user.id);
    expect(typeof workspace.updatedBy).toEqual("string");
    expect(typeof workspace.updatedAt).toEqual("string");
    expect(workspace.updatedAt).toEqual(workspace.createdAt);
    createdWorkspace = workspace;
  });

  it("An admin can get its workspace by id", async () => {
    const workspace = await adminA.get(
      SubjectType.Workspace,
      createdWorkspace.id!!
    );
    expect(workspace).toMatchObject(createdWorkspace);
  });

  it("Another admin should not be able to get nor update this workspace", async () => {
    await expect(
      adminB.get(SubjectType.Workspace, createdWorkspace.id!!)
    ).rejects.toThrow();

    await expect(
      adminB.update(SubjectType.Workspace, {
        id: createdWorkspace.id!!,
        name: "",
      })
    ).rejects.toThrow();
  });

  it("An admin can update its workspace (which updates updatedBy & updatedAt fields)", async () => {
    const updatedWorkspace = {
      ...createdWorkspace,
      name: "hisNewName",
    };
    const workspace = await adminA.update(
      SubjectType.Workspace,
      updatedWorkspace
    );

    expect(workspace).toEqual(
      expect.objectContaining({ name: updatedWorkspace.name })
    );
    expect(workspace.updatedAt).not.toEqual(updatedWorkspace.createdAt);
  });

  it("An admin can create a page in its workspace", async () => {
    const pageToCreate = {
      name: "somePageName",
      workspaceId: createdWorkspace.id,
      public: false,
    };
    await expect(
      adminA.create(SubjectType.Page, pageToCreate)
    ).resolves.toEqual(expect.objectContaining(pageToCreate));
  });

  it("An admin cannot create a page in a workspace he does not own", async () => {
    const pageToCreate = {
      name: "somePageName",
      workspaceId: createdWorkspace.id,
      public: false,
    };
    await expect(
      adminB.create(SubjectType.Page, pageToCreate)
    ).rejects.toThrow();
  });

  it("An admin can list all workspaces he created", async () => {
    const adminZ = accessManager.as({
      id: `adminUserIdZ${Math.round(Math.random() * 10000)}`,
      role: Role.WorkspaceBuilder,
    });
    const adminY = accessManager.as({
      id: `adminUserIdY${Math.round(Math.random() * 10000)}`,
      role: Role.WorkspaceBuilder,
    });

    const adminZWorkspaces = [
      await adminZ.create(SubjectType.Workspace, {
        name: `Z${Math.random() * 1000}`,
      }),
      await adminZ.create(SubjectType.Workspace, {
        name: `Z${Math.random() * 1000}`,
      }),
    ];
    const adminYWorkspaces = [
      await adminY.create(SubjectType.Workspace, {
        name: `Y${Math.random() * 1000}`,
      }),
    ];

    const workspacesZ = await adminZ.findAll(SubjectType.Workspace);
    const workspacesY = await adminY.findAll(SubjectType.Workspace);

    expect(workspacesZ).toMatchObject(adminZWorkspaces);
    expect(workspacesY).toMatchObject(adminYWorkspaces);
  });

  it("An admin can list all workspaces he created + those shared with him", async () => {
    const adminZ = accessManager.as({
      id: `adminUserIdZ${Math.round(Math.random() * 100000)}`,
      role: Role.WorkspaceBuilder,
    });
    const adminY = accessManager.as({
      id: `adminUserIdY${Math.round(Math.random() * 100000)}`,
      role: Role.WorkspaceBuilder,
    });

    const adminZWorkspaces = [
      await adminZ.create(SubjectType.Workspace, {
        name: `Z${Math.random() * 1000}`,
      }),
      await adminZ.create(SubjectType.Workspace, {
        name: `Z${Math.random() * 1000}`,
      }),
    ];
    const adminYWorkspaces = [
      await adminY.create(SubjectType.Workspace, {
        name: `Y${Math.random() * 1000}`,
      }),
    ];
    // Grant by role
    adminYWorkspaces[0] = await adminY.grant(
      Role.Admin,
      SubjectType.Workspace,
      adminYWorkspaces[0].id,
      adminZ.user!!
    );

    // Grant by permission
    adminZWorkspaces[1] = await adminZ.grant(
      ActionType.Read,
      SubjectType.Workspace,
      adminZWorkspaces[1].id,
      adminY.user!!
    );

    const workspacesZ = await adminZ.findAll(SubjectType.Workspace);
    const workspacesY = await adminY.findAll(SubjectType.Workspace);

    const sort = (workspaces: { id: string }[]) =>
      workspaces.sort((a, b) => (a.id > b.id ? 1 : -1));

    expect(sort(workspacesZ)).toMatchObject(
      sort(adminZWorkspaces.concat(adminYWorkspaces))
    );

    expect(sort(workspacesY)).toMatchObject(
      sort(adminYWorkspaces.concat([adminZWorkspaces[1]]))
    );
  });

  it("A workspace admin can list all pages of his workspace (including those he did not create himself)", async () => {
    const adminZ = accessManager.as({
      id: `adminUserIdZ${Math.round(Math.random() * 100000)}`,
      role: Role.WorkspaceBuilder,
    });
    const adminX = accessManager.as({
      id: `adminUserIdX${Math.round(Math.random() * 100000)}`,
      role: Role.WorkspaceBuilder,
    });
    const collabZ = accessManager.as({
      id: `collabUserIdZ${Math.round(Math.random() * 100000)}`,
    });

    const workspace = await adminZ.create(SubjectType.Workspace, {
      name: `Z${Math.random() * 1000}`,
    });
    const workspaceX = await adminX.create(SubjectType.Workspace, {
      name: `X${Math.random() * 1000}`,
    });

    const sharedWorkspace = await adminZ.grant(
      Role.Collaborator,
      SubjectType.Workspace,
      workspace.id,
      collabZ.user
    );

    collabZ.pullRoleFromSubject(SubjectType.Workspace, sharedWorkspace.id);

    const adminZPages = [
      await adminZ.create(SubjectType.Page, {
        name: `Z${Math.random() * 1000}`,
        workspaceId: workspace.id,
        public: false,
      }),
      await adminZ.create(SubjectType.Page, {
        name: `Z${Math.random() * 1000}`,
        workspaceId: workspace.id,
        public: false,
      }),
    ];

    const adminXPages = [
      await adminX.create(SubjectType.Page, {
        name: `X${Math.random() * 1000}`,
        workspaceId: workspaceX.id,
        public: false,
      }),
    ];

    const collabZPages = [
      await collabZ.create(SubjectType.Page, {
        name: `Z${Math.random() * 1000}`,
        workspaceId: workspace.id,
        public: false,
      }),
    ];

    const pagesZ = await adminZ.findAll(SubjectType.Page);
    const pagesX = await adminX.findAll(SubjectType.Page);

    const sort = (workspaces: { id: string }[]) =>
      workspaces.sort((a, b) => (a.id > b.id ? 1 : -1));

    expect(sort(pagesZ)).toMatchObject(sort(adminZPages.concat(collabZPages)));
    expect(pagesX).toMatchObject(adminXPages);
  });
});

describe("Role & Permissions granting", () => {
  let createdWorkspace: SubjectInterfaces[SubjectType.Workspace] & BaseSubject;
  it("Any admin can grant a specific role to someone else on its own workspace", async () => {
    // Lets make adminA create a workspace
    createdWorkspace = await adminA.create(SubjectType.Workspace, <any>{});

    // Check that adminB cannot read createdWorkspace
    await expect(
      adminB.get(SubjectType.Workspace, createdWorkspace.id)
    ).rejects.toThrow();

    const sharedWorkspace = await adminA.grant(
      Role.Admin,
      SubjectType.Workspace,
      createdWorkspace.id,
      adminB.user!!
    );
    expect(sharedWorkspace?.collaborators).toMatchObject({
      [adminB?.user?.id!!]: {
        role: Role.Admin,
      },
    });

    // Check that adminB now can read createdWorkspace
    await expect(
      adminB.get(SubjectType.Workspace, createdWorkspace.id)
    ).resolves.toMatchObject(sharedWorkspace);
  });

  it("Any admin can revoke a specific role of someone else on its own workspace", async () => {
    const unsharedWorkspace = await adminA.revoke(
      Role.Admin,
      SubjectType.Workspace,
      createdWorkspace.id,
      adminB.user!!
    );
    expect(unsharedWorkspace?.collaborators).toMatchObject({
      [adminB.user.id]: {},
    });

    // Refresh adminB to force him to "forgot" he was admin
    // TODO a way to automatically detect that ?
    // If AccessManager.as() instance is meant to be alive a long time, this would be critical ...
    const refreshedAdminB = accessManager.as({
      id: "adminUserIdB",
    });

    // Check that adminB now can't read createdWorkspace
    await expect(
      refreshedAdminB.get(SubjectType.Workspace, createdWorkspace.id)
    ).rejects.toThrow();
  });

  it("A collaborator can update a page for which he has been given update permission", async () => {
    const collaborator = accessManager.as({
      id: "someCollaboratorId",
      role: Role.Guest,
    });
    // Lets make adminA create a workspace
    const workspace = await adminA.create(SubjectType.Workspace, <any>{});

    const page = await adminA.create(SubjectType.Page, <any>{
      workspaceId: workspace.id,
      name: "some page name",
    });

    // Check that collaborator cannot read this page
    await expect(adminB.get(SubjectType.Page, page.id)).rejects.toThrow();

    const sharedPage = await adminA.grant(
      [ActionType.Read, ActionType.Update],
      SubjectType.Page,
      page.id,
      collaborator.user!!
    );

    // Check that collaborator now can read & update the page
    await expect(
      collaborator.get(SubjectType.Page, page.id)
    ).resolves.toMatchObject(sharedPage);
    await expect(
      collaborator.update(SubjectType.Page, {
        ...page,
        name: "a new name",
      })
    ).resolves.toEqual(
      expect.objectContaining({
        id: page.id,
        name: "a new name",
      })
    );

    // This does not provide him any permission on corresponding workspace !
    await expect(
      collaborator.get(SubjectType.Workspace, workspace.id)
    ).rejects.toThrow();
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
