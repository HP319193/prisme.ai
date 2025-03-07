import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { AccessManager, BaseSubject, ApiKey } from '..';
import abacWithRoles, { Role } from '../examples/abacWithRoles';

jest.setTimeout(2000);

enum ActionType {
  Manage = 'manage', // Super admin : permits every action
  ManagePermissions = 'manage_permissions',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

enum SubjectType {
  User = 'user',
  Workspace = 'workspace',
  Page = 'page',
  Event = 'event',
  Platform = 'platform',
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
      host: 'mongodb://localhost:27017/testCASL',
    },
    rbac: {
      enabledSubjectTypes: [SubjectType.Workspace],
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
  abacWithRoles
);

const adminAId = 'adminUserIdA';
const adminBId = 'adminUserIdB';
let adminA: Required<AccessManager<SubjectType, SubjectInterfaces, Role>>;
let adminB: Required<AccessManager<SubjectType, SubjectInterfaces, Role>>;
let mongod: MongoMemoryServer;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  //@ts-ignore
  accessManager.opts.storage.host = mongod.getUri();
  await accessManager.start();

  adminA = await accessManager.as({
    id: adminAId,
    role: Role.WorkspaceBuilder,
  });

  adminB = await accessManager.as({
    id: adminBId,
    role: Role.WorkspaceBuilder,
  });
});

describe('CRUD with a predefined role', () => {
  let createdWorkspace: SubjectInterfaces[SubjectType.Workspace] &
    BaseSubject<Role>;
  it('A created object is automatically initialized with base fields', async () => {
    const workspace = await adminA.create(SubjectType.Workspace, {
      name: 'workspaceName',
    });

    expect(workspace.createdBy).toEqual(adminA.user.id);
    expect(workspace.updatedBy).toEqual(adminA.user.id);
    expect(typeof workspace.updatedBy).toEqual('string');
    expect(typeof workspace.updatedAt).toEqual('string');
    expect(workspace.updatedAt).toEqual(workspace.createdAt);
    createdWorkspace = workspace;
  });

  it('An admin can get its workspace by id', async () => {
    const workspace = await adminA.get(
      SubjectType.Workspace,
      createdWorkspace.id!!
    );
    expect(workspace).toMatchObject(createdWorkspace);
  });

  it('Another admin should not be able to get nor update this workspace', async () => {
    await expect(
      adminB.get(SubjectType.Workspace, createdWorkspace.id!!)
    ).rejects.toThrow();

    await expect(
      adminB.update(SubjectType.Workspace, {
        id: createdWorkspace.id!!,
        name: '',
      })
    ).rejects.toThrow();
  });

  it('An admin can update its workspace (which updates updatedBy & updatedAt fields)', async () => {
    const updatedWorkspace = {
      ...createdWorkspace,
      name: 'hisNewName',
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

  it('An admin can create a page in its workspace', async () => {
    const pageToCreate = {
      name: 'somePageName',
      workspaceId: createdWorkspace.id,
      public: false,
    };
    await expect(
      adminA.create(SubjectType.Page, pageToCreate)
    ).resolves.toEqual(expect.objectContaining(pageToCreate));
  });

  it('An admin cannot create a page in a workspace he does not own', async () => {
    const pageToCreate = {
      name: 'somePageName',
      workspaceId: createdWorkspace.id,
      public: false,
    };
    await expect(
      adminB.create(SubjectType.Page, pageToCreate)
    ).rejects.toThrow();
  });

  it('An admin can list all workspaces he created', async () => {
    const adminZ = await accessManager.as({
      id: `adminUserIdZ${Math.round(Math.random() * 10000)}`,
      role: Role.WorkspaceBuilder,
    });
    const adminY = await accessManager.as({
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

  it('An admin can list all workspaces he created + those shared with him', async () => {
    const adminZ = await accessManager.as({
      id: `adminUserIdZ${Math.round(Math.random() * 100000)}`,
      role: Role.WorkspaceBuilder,
    });
    const adminY = await accessManager.as({
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
      await adminY.create(SubjectType.Workspace, {
        name: `YPublicRead${Math.random() * 1000}`,
      }),
      await adminY.create(SubjectType.Workspace, {
        name: `YPublicAdmin${Math.random() * 1000}`,
      }),
    ];
    // Grant by role
    adminYWorkspaces[0] = await adminY.grant(
      SubjectType.Workspace,
      adminYWorkspaces[0].id,
      { id: adminZ.user.id },
      Role.Owner
    );

    // Make a workspace public
    adminYWorkspaces[1] = await adminY.grant(
      SubjectType.Workspace,
      adminYWorkspaces[1].id,
      { public: true },
      ActionType.Read
    );

    // Make a workspace publicly "admin"
    adminYWorkspaces[2] = await adminY.grant(
      SubjectType.Workspace,
      adminYWorkspaces[2].id,
      { public: true },
      Role.Owner
    );

    // Grant by permission
    adminZWorkspaces[1] = await adminZ.grant(
      SubjectType.Workspace,
      adminZWorkspaces[1].id,
      { id: adminY.user.id },
      ActionType.Read
    );

    const workspacesZ = await adminZ.findAll(SubjectType.Workspace);

    const sort = (workspaces: { id: string }[]) =>
      workspaces.sort((a, b) => (a.id > b.id ? 1 : -1));

    expect(sort(workspacesZ)).toMatchObject(
      sort(
        adminZWorkspaces.concat(
          adminYWorkspaces.map((cur) => {
            if (cur.name.startsWith('YPublicRead')) {
              delete cur.permissions;
            }
            return cur;
          })
        )
      )
    );
  });

  it('A workspace admin can list all pages of his workspace (including those he did not create himself)', async () => {
    const adminZ = await accessManager.as({
      id: `adminUserIdZ${Math.round(Math.random() * 100000)}`,
      role: Role.WorkspaceBuilder,
    });
    const adminX = await accessManager.as({
      id: `adminUserIdX${Math.round(Math.random() * 100000)}`,
      role: Role.WorkspaceBuilder,
    });
    const collabZ = await accessManager.as({
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
      { id: collabZ.user.id },
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

describe('Role & Permissions granting', () => {
  let createdWorkspace: SubjectInterfaces[SubjectType.Workspace] & BaseSubject;
  it('Any admin can grant a specific role to someone else on its own workspace', async () => {
    // Lets make adminA create a workspace
    createdWorkspace = await adminA.create(SubjectType.Workspace, <any>{});

    // Check that adminB cannot read createdWorkspace
    await expect(
      adminB.get(SubjectType.Workspace, createdWorkspace.id)
    ).rejects.toThrow();

    const sharedWorkspace = await adminA.grant(
      SubjectType.Workspace,
      createdWorkspace.id,
      { id: adminB.user.id },
      Role.Owner
    );
    expect(sharedWorkspace?.permissions).toMatchObject({
      [adminB?.user?.id!!]: {
        role: Role.Owner,
      },
    });

    // Check that adminB now can read createdWorkspace
    await expect(
      adminB.get(SubjectType.Workspace, createdWorkspace.id)
    ).resolves.toMatchObject(sharedWorkspace);
  });

  it('Any admin can revoke all permissions from someone else on its own workspace', async () => {
    const unsharedWorkspace = await adminA.revoke(
      SubjectType.Workspace,
      createdWorkspace.id,
      adminB.user.id!!
    );
    expect(unsharedWorkspace?.permissions).not.toHaveProperty(adminB.user.id);

    // Refresh adminB to force him to "forgot" he was admin
    // TODO a way to automatically detect that ?
    // If AccessManager.as() instance is meant to be alive a long time, this would be critical ...
    const refreshedAdminB = await accessManager.as({
      id: 'adminUserIdB',
    });

    // Check that adminB now can't read createdWorkspace
    await expect(
      refreshedAdminB.get(SubjectType.Workspace, createdWorkspace.id)
    ).rejects.toThrow();
  });

  it('A collaborator can update a page for which he has been given update permission', async () => {
    const collaborator = await accessManager.as({
      id: 'someCollaboratorId',
      role: Role.Guest,
    });
    // Lets make adminA create a workspace
    const workspace = await adminA.create(SubjectType.Workspace, <any>{});

    const page = await adminA.create(SubjectType.Page, <any>{
      workspaceId: workspace.id,
      name: 'some page name',
    });

    // Check that collaborator cannot read this page
    await expect(adminB.get(SubjectType.Page, page.id)).rejects.toThrow();

    const sharedPage = await adminA.grant(
      SubjectType.Page,
      page.id,
      { id: collaborator.user.id },
      [ActionType.Read, ActionType.Update]
    );

    // Check that collaborator now can read & update the page (but not its permissions field !)
    const { permissions, ...sharedWithoutCollaborators } = sharedPage;
    await expect(
      collaborator.get(SubjectType.Page, page.id)
    ).resolves.toMatchObject(sharedWithoutCollaborators);
    await expect(
      collaborator.update(SubjectType.Page, {
        ...page,
        name: 'a new name',
      })
    ).resolves.toEqual(
      expect.objectContaining({
        id: page.id,
        name: 'a new name',
      })
    );

    // This does not provide him any permission on corresponding workspace !
    await expect(
      collaborator.get(SubjectType.Workspace, workspace.id)
    ).rejects.toThrow();
  });

  it("Trying to fetch an object whose permissions depend on another one automatically pulls this other object's permissions", async () => {
    const collaborator = await accessManager.as({
      id: 'someCollaboratorId',
      role: Role.Guest,
    });
    // Lets make adminA create a workspace
    const workspace = await adminA.create(SubjectType.Workspace, <any>{});
    const page = await adminA.create(SubjectType.Page, <any>{
      workspaceId: workspace.id,
      name: 'some page name',
    });

    // Check that collaborator initially cannot read this page
    await expect(adminB.get(SubjectType.Page, page.id)).rejects.toThrow();

    await adminA.grant(
      SubjectType.Workspace,
      workspace.id,
      { id: collaborator.user.id },
      Role.Owner
    );

    // Check that collaborator now can read & update the page (but not its permissions field !)
    await expect(
      collaborator.get(SubjectType.Page, page.id)
    ).resolves.toMatchObject(page);
  });
});

describe('API Keys', () => {
  const ourWorkspace = {
    id: 'ourWorkspaceId' + Math.round(Math.random() * 10000),
    name: 'ourWorkspace',
    permissions: {
      [adminAId]: {
        role: 'owner',
      },
    },
  };
  const anotherWorkspace = {
    id: 'anotherWorkspaceId' + Math.round(Math.random() * 10000),
    name: 'anotherWorkspace',
    permissions: {
      anotherAdminId: {
        role: 'owner',
      },
      [adminBId]: {
        role: 'owner',
      },
    },
  };

  // Required just because "describe" blocks are executed before "beforeAll" resolution
  it('Setup', () => {
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

    // Prevent from fetching non existent data
    [adminA, adminB].forEach((admin) => {
      const throwUnlessCan = admin.throwUnlessCan.bind(admin);
      admin.throwUnlessCan = (
        actionType: ActionType,
        subjectType: SubjectType,
        idOrSubject: object | string
      ) => {
        if (idOrSubject === ourWorkspace.id) {
          return throwUnlessCan(actionType, subjectType, ourWorkspace);
        }
        if (idOrSubject === anotherWorkspace.id) {
          return throwUnlessCan(actionType, subjectType, anotherWorkspace);
        }
        return throwUnlessCan(actionType, subjectType, idOrSubject);
      };
    });
  });

  const ourWorkspaceAPIKey: ApiKey<SubjectType> = {
    apiKey: 'will be defined on creation',
    subjectType: SubjectType.Workspace,
    subjectId: ourWorkspace.id,
    rules: [
      {
        action: ActionType.Read,
        subject: SubjectType.Event,
        conditions: {
          type: {
            $in: ['event1', 'event4'],
          },
        },
      },
    ],
  };

  const allowedEvent = {
    type: ourWorkspaceAPIKey.rules[0].conditions.type['$in'][0],
    source: {
      workspaceId: ourWorkspace.id,
    },
    id: 'someId',
  };

  it("Can't load an unknown api key", async () => {
    await expect(
      //@ts-ignore
      adminA.pullApiKey('someUnknownAPIKey')
    ).rejects.toThrow();
  });

  it("Can't create an API Key on a subject without manage_permissions permission", async () => {
    await expect(
      adminA.createApiKey(SubjectType.Workspace, anotherWorkspace.id, {
        name: 'myApiKey',
        rules: ourWorkspaceAPIKey.rules,
      })
    ).rejects.toThrow();
  });

  let ourSavedApiKey: ApiKey<SubjectType>;
  it('A workspace admin can create an API key for this workspace', async () => {
    await expect(
      adminA
        .createApiKey(SubjectType.Workspace, ourWorkspace.id, {
          name: 'myApiKey',
          rules: ourWorkspaceAPIKey.rules,
        })
        .then((apiKey) => {
          ourSavedApiKey = apiKey;
          return apiKey;
        })
    ).resolves.toEqual(
      expect.objectContaining({
        rules: ourWorkspaceAPIKey.rules,
        subjectId: ourWorkspaceAPIKey.subjectId,
        subjectType: ourWorkspaceAPIKey.subjectType,
      })
    );

    await expect(
      adminB.createApiKey(SubjectType.Workspace, anotherWorkspace.id, {
        name: 'myApiKey',
        rules: ourWorkspaceAPIKey.rules,
      })
    ).resolves.toEqual(
      expect.objectContaining({ subjectId: anotherWorkspace.id })
    );
  });

  it("An admin can update its workspace's api keys", async () => {
    const newPayload = [
      {
        ...ourWorkspaceAPIKey.rules[0],
        conditions: {
          type: {
            $in: ['event1', 'event4', 'someOtherEvent'],
          },
        },
      },
    ];
    await expect(
      adminA
        .updateApiKey(
          ourSavedApiKey.apiKey,
          SubjectType.Workspace,
          ourWorkspace.id,
          { name: 'myApiKey', rules: newPayload }
        )
        .then((apiKey) => {
          ourSavedApiKey = apiKey;
          return apiKey;
        })
    ).resolves.toEqual(
      expect.objectContaining({
        rules: newPayload,
        subjectId: ourWorkspaceAPIKey.subjectId,
        subjectType: ourWorkspaceAPIKey.subjectType,
      })
    );
  });

  it('A workspace admin can list the api keys of his workspace', async () => {
    await expect(
      //@ts-ignore
      adminB.findApiKeys(SubjectType.Workspace, ourWorkspace.id)
    ).rejects.toThrow();

    await expect(
      //@ts-ignore
      adminA.findApiKeys(SubjectType.Workspace, ourWorkspace.id)
    ).resolves.toMatchObject([ourSavedApiKey]);
  });

  it('Any user authenticated with an api key automatically escalate corresponding permissions', async () => {
    await expect(
      adminB.throwUnlessCan(ActionType.Read, SubjectType.Event, allowedEvent)
    ).rejects.toThrow();

    //@ts-ignore
    await adminB.pullApiKey(ourSavedApiKey.apiKey);
    await expect(
      adminB.throwUnlessCan(ActionType.Read, SubjectType.Event, allowedEvent)
    ).resolves.toBe(true);

    await expect(
      adminB.throwUnlessCan(ActionType.Read, SubjectType.Event, {
        ...allowedEvent,
        type: 'someRandomForbiddenType',
      })
    ).rejects.toThrow();
  });

  it('A workspace admin can delete the workspace api keys', async () => {
    await expect(
      adminA.deleteApiKey(
        ourSavedApiKey.apiKey,
        ourSavedApiKey.subjectType,
        ourSavedApiKey.subjectId
      )
    ).resolves.toBe(true);

    await expect(
      //@ts-ignore
      adminA.findApiKeys(SubjectType.Workspace, ourWorkspace.id)
    ).resolves.toMatchObject([]);
  });
});

describe('Custom roles granted from auth data', () => {
  it('Roles can be automatically granted depending on given user auth data', async () => {
    // Lets make adminA create a workspace
    const workspace = await adminA.create(SubjectType.Workspace, {
      name: 'workspaceName',
    });
    const workspaceId = workspace.id!;
    let agent = await accessManager.as({
      id: 'someAdminId',
      authData: {
        prismeai: {
          id: 'someAdminId',
          email: 'someAgent@prisme.ai',
        },
      },
    });

    // Check that agent cannot read workspace
    await expect(
      agent.get(SubjectType.Workspace, workspace.id)
    ).rejects.toThrow();

    await adminA.saveRole({
      id: `workspaces/${workspaceId}/role/agent`,
      name: 'agent',
      type: 'role',
      subjectType: SubjectType.Workspace,
      subjectId: workspaceId,
      rules: [
        {
          action: ['read', 'manage_permissions'],
          subject: ['workspace'],
          conditions: {
            id: workspaceId,
          },
        },
      ],
      auth: {
        prismeai: {
          conditions: {
            'authData.email': 'someAgent@prisme.ai',
          },
        },
      },
    });

    // Check that agent now can read workspace
    await expect(
      agent.get(SubjectType.Workspace, workspaceId)
    ).resolves.toMatchObject(workspace);
    await expect(
      agent.getLoadedSubjectRole(SubjectType.Workspace, workspaceId)
    ).toBe('agent');
  });

  it('Roles can targe a subset of users with conditions', async () => {
    // Lets make adminA create a workspace
    const workspace = await adminA.create(SubjectType.Workspace, {
      name: 'workspaceName',
    });
    const workspaceId = workspace.id!;
    let agent = await accessManager.as({
      id: 'someAdminId',
      authData: {
        prismeai: {
          id: 'someAdminId',
          email: 'someAgent@prisme.ai',
        },
      },
    });

    await adminA.saveRole({
      id: `workspaces/${workspaceId}/role/agent`,
      name: 'agent',
      type: 'role',
      subjectType: SubjectType.Workspace,
      subjectId: workspaceId,
      rules: [
        {
          action: ['read', 'manage_permissions'],
          subject: ['workspace'],
          conditions: {
            id: workspaceId,
          },
        },
      ],
      auth: {
        prismeai: {
          conditions: {
            'authData.email': 'someOtherAgent@prisme.ai',
          },
        },
      },
    });

    // Check that agent cannot read workspace
    await expect(
      agent.get(SubjectType.Workspace, workspace.id)
    ).rejects.toThrow();

    agent.user.authData = {
      prismeai: {
        id: 'someAdminId',
        email: 'someOtherAgent@prisme.ai',
      },
    };

    // Check that agent can now read workspace
    await expect(
      agent.get(SubjectType.Workspace, workspaceId)
    ).resolves.toMatchObject(workspace);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
});
