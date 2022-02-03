import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { AccessManager, BaseSubject, CustomRole } from "..";
import abacWithRoles, { Role } from "../examples/abacWithRoles";
import apiKeys from "../examples/apiKeys";

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
  Platform = "platform",
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
  [SubjectType.Platform]: {};
};

const accessManager = new AccessManager<SubjectType, SubjectInterfaces, Role>(
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
      event: false,
      platform: false,
    },
  },
  {
    ...abacWithRoles,
    roleBuilder: apiKeys.roleBuilder,
  }
);

let mongod: MongoMemoryServer;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  //@ts-ignore
  accessManager.opts.storage.host = mongod.getUri();
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
  let createdWorkspace: SubjectInterfaces[SubjectType.Workspace] &
    BaseSubject<Role>;
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
      SubjectType.Workspace,
      adminYWorkspaces[0].id,
      adminZ.user!!,
      Role.Admin
    );

    // Grant by permission
    adminZWorkspaces[1] = await adminZ.grant(
      SubjectType.Workspace,
      adminZWorkspaces[1].id,
      adminY.user!!,
      ActionType.Read
    );

    const workspacesZ = await adminZ.findAll(SubjectType.Workspace);

    const sort = (workspaces: { id: string }[]) =>
      workspaces.sort((a, b) => (a.id > b.id ? 1 : -1));

    expect(sort(workspacesZ)).toMatchObject(
      sort(adminZWorkspaces.concat(adminYWorkspaces))
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
      SubjectType.Workspace,
      workspace.id,
      collabZ.user,
      Role.Collaborator
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
  let createdWorkspace: SubjectInterfaces[SubjectType.Workspace] &
    BaseSubject<Role>;
  it("Any admin can grant a specific role to someone else on its own workspace", async () => {
    // Lets make adminA create a workspace
    createdWorkspace = await adminA.create(SubjectType.Workspace, <any>{});

    // Check that adminB cannot read createdWorkspace
    await expect(
      adminB.get(SubjectType.Workspace, createdWorkspace.id)
    ).rejects.toThrow();

    const sharedWorkspace = await adminA.grant(
      SubjectType.Workspace,
      createdWorkspace.id,
      adminB.user!!,
      Role.Admin
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
      SubjectType.Workspace,
      createdWorkspace.id,
      adminB.user!!,
      Role.Admin
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
      SubjectType.Page,
      page.id,
      collaborator.user!!,
      [ActionType.Read, ActionType.Update]
    );

    // Check that collaborator now can read & update the page (but not its collaborators field !)
    const { collaborators, ...sharedWithoutCollaborators } = sharedPage;
    await expect(
      collaborator.get(SubjectType.Page, page.id)
    ).resolves.toMatchObject(sharedWithoutCollaborators);
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

describe("API Keys", () => {
  const ourWorkspace = {
    id: "ourWorkspaceId",
    name: "ourWorkspace",
    collaborators: {
      [adminA.user.id]: {
        role: "admin",
      },
    },
  };
  const anotherWorkspace = {
    id: "anotherWorkspaceId",
    name: "anotherWorkspace",
    collaborators: {
      anotherAdminId: {
        role: "admin",
      },
      [adminB.user.id]: {
        role: "admin",
      },
    },
  };
  //@ts-ignore
  adminA.permissions.pullRoleFromSubject(SubjectType.Workspace, ourWorkspace);
  //@ts-ignore
  adminA.permissions.pullRoleFromSubject(
    SubjectType.Workspace,
    anotherWorkspace
  );
  //@ts-ignore
  adminB.permissions.pullRoleFromSubject(
    SubjectType.Workspace,
    anotherWorkspace
  );

  const ourWorkspaceAPIKey: Omit<CustomRole<SubjectType>, "rules"> = {
    name: "myApiKey",
    apiKey: "myApiKey",
    subjectType: SubjectType.Workspace,
    subjectId: ourWorkspace.id,
    payload: {
      allowedEvents: ["event1", "event4"],
    },
  };

  const allowedEvent = {
    type: ourWorkspaceAPIKey.payload.allowedEvents[0],
    source: {
      workspaceId: ourWorkspace.id,
    },
    id: "someId",
  };

  const eventFromAnotherWorkspace = {
    type: ourWorkspaceAPIKey.payload.allowedEvents[0],
    source: {
      workspaceId: anotherWorkspace.id,
    },
    id: "someOtherId",
  };

  it("Can't load an unknown api key", async () => {
    await expect(
      //@ts-ignore
      adminA.pullRole({ apiKey: "someUnknownAPIKey" })
    ).rejects.toThrow();
  });

  it("Can't create an API Key on a subject without manage_collaborators permission", async () => {
    await expect(
      adminA.saveRole({
        ...ourWorkspaceAPIKey,
        subjectId: anotherWorkspace.id,
      })
    ).rejects.toThrow();
  });

  let ourSavedApiKey: CustomRole<SubjectType>;
  it("A workspace admin can create an API key for this workspace", async () => {
    await expect(
      adminA.saveRole(ourWorkspaceAPIKey).then((apiKey) => {
        ourSavedApiKey = apiKey;
        return apiKey;
      })
    ).resolves.toEqual(expect.objectContaining(ourWorkspaceAPIKey));

    await expect(
      adminB.saveRole({
        ...ourWorkspaceAPIKey,
        subjectId: anotherWorkspace.id,
        apiKey: "anotherWorkspaceApiKey",
        name: "anotherWorkspaceApiKey",
      })
    ).resolves.toEqual(
      expect.objectContaining({ subjectId: anotherWorkspace.id })
    );
  });

  it("A workspace admin can list the api keys of his workspace", async () => {
    await expect(
      //@ts-ignore
      adminB.findRoles(SubjectType.Workspace, ourWorkspace.id)
    ).rejects.toThrow();

    await expect(
      //@ts-ignore
      adminA.findRoles(SubjectType.Workspace, ourWorkspace.id)
    ).resolves.toMatchObject([ourSavedApiKey]);
  });

  it("Any user authenticated with an api key automatically escalate corresponding permissions", async () => {
    await expect(
      adminB.throwUnlessCan(ActionType.Read, SubjectType.Event, allowedEvent)
    ).rejects.toThrow();

    //@ts-ignore
    await adminB.pullRole({ apiKey: ourWorkspaceAPIKey.apiKey });

    await expect(
      adminB.throwUnlessCan(ActionType.Read, SubjectType.Event, allowedEvent)
    ).resolves.toBe(true);

    await expect(
      adminB.throwUnlessCan(ActionType.Read, SubjectType.Event, {
        ...allowedEvent,
        type: "someRandomForbiddenType",
      })
    ).rejects.toThrow();
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
});
