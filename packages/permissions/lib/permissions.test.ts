import {
  ActionType,
  Permissions,
  PermissionsConfig,
  SubjectCollaborators,
} from '..';
import configs from '../examples';

export type Subject = Record<string, any> & {
  id?: string;
  permissions?: SubjectCollaborators<Role>;
};

export enum SubjectType {
  User = 'user',
  Workspace = 'workspace',
  Page = 'page',
  Event = 'event',
  Platform = 'platform',
}

enum Role {
  Admin = 'admin',
  Collaborator = 'collaborator',
  Guest = 'guest',
}

describe('Access management', () => {
  const config: PermissionsConfig<SubjectType, Role> = configs.accessManagement;

  it('Admins can create workspaces/pages', () => {
    const perms = new Permissions({ id: 'myUserId', role: Role.Admin }, config);
    expect(perms.can(ActionType.Create, SubjectType.Workspace)).toBe(true);
    expect(perms.can(ActionType.Create, SubjectType.Page)).toBe(true);
  });

  it('Guests cannot create workspaces nor pages', () => {
    const perms = new Permissions({ id: 'myUserId', role: Role.Guest }, config);
    expect(perms.can(ActionType.Create, SubjectType.Workspace)).toBe(false);
    expect(perms.can(ActionType.Create, SubjectType.Page)).toBe(false);
  });

  it('Admin can read all events', () => {
    const eventA = {
      type: 'apps.someApp.A',
    } as any as Subject;

    const permsAdmin = new Permissions(
      { id: 'myUserId', role: Role.Admin },
      config
    );
    expect(permsAdmin.can(ActionType.Read, SubjectType.Event)).toBe(true);
    expect(permsAdmin.can(ActionType.Read, SubjectType.Event, eventA)).toBe(
      true
    );
  });

  it('Guests cannot read any event if not explicitly authorized', () => {
    const eventA = {
      type: 'apps.someApp.A',
      createdBy: 'erg',
    } as any as Subject;
    const permsGuest = new Permissions(
      { id: 'myUserId', role: Role.Guest },
      config
    );

    expect(permsGuest.can(ActionType.Read, SubjectType.Event, eventA)).toBe(
      false
    );
  });

  it('Guest/Admin cannot delete events', () => {
    const permsGuest = new Permissions(
      { id: 'myUserId', role: Role.Guest },
      config
    );
    expect(permsGuest.can(ActionType.Delete, SubjectType.Event)).toBe(false);

    const permsAdmin = new Permissions(
      { id: 'myUserId', role: Role.Admin },
      config
    );
    expect(permsAdmin.can(ActionType.Delete, SubjectType.Event)).toBe(false);
    expect(permsAdmin.can(ActionType.Update, SubjectType.Event)).toBe(false);
  });

  it('All reads should be refused by default', () => {
    const eventA = {
      type: 'apps.someApp.A',
    } as any as Subject;

    // Our collaborator role hasn't any permission defined
    const permsCollaborator = new Permissions(
      { id: 'myUserId', role: Role.Collaborator },
      config
    );
    expect(
      permsCollaborator.can(ActionType.Read, SubjectType.Page, <any>{
        id: 'blabla',
        createdBy: 'pageAuthorId',
      })
    ).toBe(false);
  });
});

const config: PermissionsConfig<SubjectType, Role> = configs.abac;

describe('ABAC > Some custom attribute based authorization', () => {
  it('Everyone can read a public page', () => {
    const permsGuest = new Permissions(
      { id: 'myUserId', role: Role.Guest },
      config
    );
    const page: Subject = {
      id: 'somePage',
      createdBy: 'someRandomGuy',
      public: true,
    } as any as Subject;
    expect(permsGuest.can(ActionType.Read, SubjectType.Page, page)).toBe(true);

    const permsAdmin = new Permissions(
      { id: 'myUserId', role: Role.Admin },
      config
    );
    expect(permsAdmin.can(ActionType.Read, SubjectType.Page, page)).toBe(true);
  });

  it('Guests can read some events if they have been authorized to', () => {
    const permsGuest = new Permissions(
      { id: 'myUserId', role: Role.Guest },
      config
    );

    expect(
      permsGuest.can(ActionType.Read, SubjectType.Event, {
        type: 'apps.someAuthorizedApp.A',
      } as any as Subject)
    ).toBe(true);

    expect(
      permsGuest.can(ActionType.Read, SubjectType.Event, {
        type: 'apps.unauthorizedApp.A',
      } as any as Subject)
    ).toBe(false);
  });
});

describe('ABAC > Owner permissions', () => {
  it('Any collaborator or admin should be able to update its own workspace/page', () => {
    const collabPerms = new Permissions(
      { id: 'myUserId', role: Role.Collaborator },
      config
    );
    expect(
      collabPerms.can(ActionType.Update, SubjectType.Workspace, <any>{
        createdBy: 'myUserId',
      })
    ).toBe(true);
    expect(
      collabPerms.can(ActionType.Update, SubjectType.Page, <any>{
        createdBy: 'myUserId',
      })
    ).toBe(true);

    const adminPerms = new Permissions(
      { id: 'myUserId', role: Role.Admin },
      config
    );
    expect(
      adminPerms.can(ActionType.Update, SubjectType.Workspace, <any>{
        createdBy: 'myUserId',
      })
    ).toBe(true);
    expect(
      adminPerms.can(ActionType.Update, SubjectType.Page, <any>{
        createdBy: 'myUserId',
      })
    ).toBe(true);
  });

  it('Nobody (including admins) should be able to read/update a workspace/page of someone else', () => {
    const perms = new Permissions({ id: 'myUserId', role: Role.Admin }, config);
    expect(
      perms.can(ActionType.Read, SubjectType.Workspace, <any>{
        id: 'gneuh',
        createdBy: 'someOtherUserId',
      })
    ).toBe(false);
    expect(
      perms.can(ActionType.Read, SubjectType.Page, <any>{
        id: 'gneuh',
        createdBy: 'someOtherUserId',
      })
    ).toBe(false);

    expect(
      perms.can(ActionType.Update, SubjectType.Workspace, <any>{
        id: 'gneuh',
        createdBy: 'someOtherUserId',
      })
    ).toBe(false);
    expect(
      perms.can(ActionType.Update, SubjectType.Page, <any>{
        id: 'gneuh',
        createdBy: 'someOtherUserId',
      })
    ).toBe(false);
  });

  it('Admin or guest can manage their own user', () => {
    const permsAdmin = new Permissions(
      { id: 'myUserId', role: Role.Admin },
      config
    );
    expect(
      permsAdmin.can(ActionType.Read, SubjectType.User, <any>{
        id: 'myUserId',
      })
    ).toBe(true);

    const permsGuest = new Permissions(
      { id: 'myUserId', role: Role.Guest },
      config
    );
    expect(
      permsGuest.can(ActionType.Update, SubjectType.User, <any>{
        id: 'myUserId',
      })
    ).toBe(true);
  });

  it('Nobody (including admins) should be able to manage some other user', () => {
    const permsAdmin = new Permissions(
      { id: 'myUserId', role: Role.Admin },
      config
    );
    expect(
      permsAdmin.can(ActionType.Read, SubjectType.User, <any>{
        id: 'someOtherUserId',
      })
    ).toBe(false);

    const permsGuest = new Permissions(
      { id: 'myUserId', role: Role.Guest },
      config
    );
    expect(
      permsGuest.can(ActionType.Update, SubjectType.User, <any>{
        id: 'someOtherUserId',
      })
    ).toBe(false);
  });
});

describe('ABAC > Grant permissions', () => {
  it('Any admin can grant a specific permission to someone else on its own workspace', () => {
    const adminUser = { id: 'adminUserId', role: Role.Admin };
    const collaboratorUser = {
      id: 'collaboratorId',
      role: Role.Collaborator,
    };
    const collaboratorPerms = new Permissions(collaboratorUser, config);
    const adminPerms = new Permissions(adminUser, config);
    const adminWorkspace = {
      id: 'hisWorkspaceId',
      createdBy: adminUser.id,
    } as Subject;

    // The collaborator initially can't read this workspace !
    expect(
      collaboratorPerms.can(
        ActionType.Read,
        SubjectType.Workspace,
        adminWorkspace
      )
    ).toBe(false);

    let sharedWorkspace: Subject;
    expect(() => {
      sharedWorkspace = adminPerms.grant(
        ActionType.Read,
        SubjectType.Workspace,
        adminWorkspace,
        collaboratorUser
      ) as any as Subject;
    }).not.toThrow();

    expect(sharedWorkspace!!.permissions).toMatchObject({
      [collaboratorUser.id]: {
        // role: Role.Collaborator,
        policies: {
          [ActionType.Read]: true,
        },
      },
    });

    // The collaborator now can read this workspace !
    expect(
      collaboratorPerms.can(
        ActionType.Read,
        SubjectType.Workspace,
        sharedWorkspace!!
      )
    ).toBe(true);
  });

  it('Any admin can grant a list of permissions to someone else on its own workspace', () => {
    const adminUser = { id: 'adminUserId', role: Role.Admin };
    const collaboratorUser = {
      id: 'collaboratorId',
      role: Role.Collaborator,
    };
    const collaboratorPerms = new Permissions(collaboratorUser, config);
    const adminPerms = new Permissions(adminUser, config);
    const adminWorkspace = {
      id: 'hisWorkspaceId',
      createdBy: adminUser.id,
    } as Subject;

    // The collaborator initially can't read nor delete this workspace !
    expect(
      collaboratorPerms.can(
        ActionType.Read,
        SubjectType.Workspace,
        adminWorkspace
      )
    ).toBe(false);
    expect(
      collaboratorPerms.can(
        ActionType.Delete,
        SubjectType.Workspace,
        adminWorkspace
      )
    ).toBe(false);

    let sharedWorkspace: Subject;
    expect(() => {
      sharedWorkspace = adminPerms.grant(
        [ActionType.Read, ActionType.Delete],
        SubjectType.Workspace,
        adminWorkspace,
        collaboratorUser
      ) as any as Subject;
    }).not.toThrow();
    // He can also update collaborators field manually
    expect(
      adminPerms.can(
        ActionType.Update,
        SubjectType.Workspace,
        <any>adminWorkspace,
        'permissions'
      )
    ).toBe(true);

    expect(sharedWorkspace!!.permissions).toMatchObject({
      [collaboratorUser.id]: {
        policies: {
          [ActionType.Read]: true,
          [ActionType.Delete]: true,
        },
      },
    });

    // The collaborator now can read & delete this workspace !
    expect(
      collaboratorPerms.can(
        ActionType.Read,
        SubjectType.Workspace,
        sharedWorkspace!!
      )
    ).toBe(true);
    expect(
      collaboratorPerms.can(
        ActionType.Delete,
        SubjectType.Workspace,
        sharedWorkspace!!
      )
    ).toBe(true);
  });

  it('Any admin can grant a specific permission to someone else on a workspace he has been granted manage_permissions permission', () => {
    const adminUser = { id: 'adminUserId', role: Role.Admin };
    const collaboratorUser = {
      id: 'collaboratorId',
      role: Role.Collaborator,
    };
    const collaboratorUser2 = {
      id: 'collaboratorId2',
      role: Role.Collaborator,
    };
    const collaboratorPerms = new Permissions(collaboratorUser, config);
    const collaboratorPerms2 = new Permissions(collaboratorUser2, config);
    const adminPerms = new Permissions(adminUser, config);
    const adminWorkspace = {
      id: 'hisWorkspaceId',
      createdBy: adminUser.id,
    } as Subject;

    // The first collaborator initially can't share this workspace !
    expect(() =>
      collaboratorPerms.grant(
        ActionType.Read,
        SubjectType.Workspace,
        adminWorkspace,
        collaboratorUser2
      )
    ).toThrow();
    // Our last collaborator can't read this workspace either
    expect(
      collaboratorPerms2.can(
        ActionType.Read,
        SubjectType.Workspace,
        adminWorkspace!!
      )
    ).toBe(false);

    let sharedWorkspace: Subject;
    expect(() => {
      sharedWorkspace = adminPerms.grant(
        ActionType.ManagePermissions,
        SubjectType.Workspace,
        adminWorkspace,
        collaboratorUser
      ) as any as Subject;
    }).not.toThrow();

    expect(sharedWorkspace!!.permissions).toMatchObject({
      [collaboratorUser.id]: {
        // role: Role.Collaborator,
        policies: {
          [ActionType.ManagePermissions]: true,
        },
      },
    });

    // The collaborator now can share this workspace !
    expect(() => {
      sharedWorkspace = collaboratorPerms.grant(
        ActionType.Read,
        SubjectType.Workspace,
        sharedWorkspace!!,
        collaboratorUser2
      ) as any as Subject;
    }).not.toThrow();

    // Thus, the second collaborator can read this workspace
    expect(
      collaboratorPerms2.can(
        ActionType.Read,
        SubjectType.Workspace,
        sharedWorkspace!!
      )
    ).toBe(true);
  });

  it('An admin can revoke a specific permission from any collaborator on one of his workspaces', () => {
    const adminUser = { id: 'adminUserId', role: Role.Admin };
    const collaboratorUser = {
      id: 'collaboratorId',
      role: Role.Collaborator,
    };
    const collaboratorPerms = new Permissions(collaboratorUser, config);
    const adminPerms = new Permissions(adminUser, config);
    const adminWorkspace = {
      id: 'hisWorkspaceId',
      createdBy: adminUser.id,
      permissions: {
        [collaboratorUser.id]: {
          policies: {
            [ActionType.Read]: true,
          },
        },
      },
    } as Subject;

    // The collaborator can initially read this workspace
    expect(
      collaboratorPerms.can(
        ActionType.Read,
        SubjectType.Workspace,
        adminWorkspace
      )
    ).toBe(true);

    let unsharedWorkspace: Subject;
    expect(() => {
      unsharedWorkspace = adminPerms.revoke(
        [ActionType.Read, ActionType.Delete],
        SubjectType.Workspace,
        adminWorkspace,
        collaboratorUser
      ) as any as Subject;
    }).not.toThrow();

    // The collaborator now can't read anymore this workspace !
    expect(
      collaboratorPerms.can(
        ActionType.Read,
        SubjectType.Workspace,
        unsharedWorkspace!!
      )
    ).toBe(false);
  });

  it('No admin can update collaborators field without manage_permissions permission', () => {
    const adminPerms = new Permissions(
      { id: 'myUserId', role: Role.Admin },
      config
    );
    const workspace = {
      id: 'workspaceId',
      createdBy: 'someOtherGuy',
      permissions: {
        myUserId: {
          policies: {
            [ActionType.Update]: true,
          },
        },
      },
    };

    // He can update this workspace
    expect(
      adminPerms.can(ActionType.Update, SubjectType.Workspace, <any>workspace)
    ).toBe(true);
    // But he cannot update permissions field !
    expect(
      adminPerms.can(
        ActionType.Update,
        SubjectType.Workspace,
        <any>workspace,
        'permissions'
      )
    ).toBe(false);
  });
});

describe('Subject-attached Roles', () => {
  const config: PermissionsConfig<SubjectType, Role> =
    configs.roles as PermissionsConfig<SubjectType, Role>;

  it('A workspace admin can fully manage it', () => {
    const adminUser = {
      id: 'someRandomAdminUserId',
    };
    const adminPerms = new Permissions(adminUser, config);
    const workspace = {
      id: 'hisWorkspaceId',
      createdBy: 'someOtherAdminId',
      permissions: {
        [adminUser.id]: {
          role: Role.Admin,
        },
      },
    } as Subject;

    // The admin can fully manage this workspace
    expect(
      adminPerms.can(ActionType.Manage, SubjectType.Workspace, workspace)
    ).toBe(true);
  });

  it('A workspace admin cannot read another workspace', () => {
    const adminUser = {
      id: 'someRandomAdminUserId',
    };
    const adminPerms = new Permissions(adminUser, config);
    const hisWorkspace = {
      id: 'hisWorkspaceId',
      createdBy: 'someOtherAdminId',
      permissions: {
        [adminUser.id]: {
          role: Role.Admin,
        },
      },
    } as Subject;

    // The admin can fully manage this workspace
    expect(
      adminPerms.can(ActionType.Manage, SubjectType.Workspace, hisWorkspace)
    ).toBe(true);

    const anotherWorkspace = {
      id: 'anotherWorkspaceId',
      createdBy: 'someOtherAdminId',
      permissions: {
        someOtherAdminId: {
          role: Role.Admin,
        },
      },
    } as any as Subject;

    // The admin cannot read this other workspace
    expect(
      adminPerms.can(ActionType.Read, SubjectType.Workspace, anotherWorkspace)
    ).toBe(false);
  });

  it('Workspace collaborators can update the workspace but cannot delete it', () => {
    const collaboratorUser = {
      id: 'collaboratorId',
      // role: Role.Collaborator,
    };
    const collaboratorPerms = new Permissions(collaboratorUser, config);
    const workspace = {
      id: 'hisWorkspaceId',
      createdBy: 'someAdminId',
      permissions: {
        [collaboratorUser.id]: {
          role: Role.Collaborator,
        },
      },
    } as Subject;

    // The collaborator can read or update this workspace
    expect(
      collaboratorPerms.can(ActionType.Read, SubjectType.Workspace, workspace)
    ).toBe(true);
    expect(
      collaboratorPerms.can(ActionType.Update, SubjectType.Workspace, workspace)
    ).toBe(true);

    // But he cannot delete nor fully manage it
    expect(
      collaboratorPerms.can(ActionType.Delete, SubjectType.Workspace, workspace)
    ).toBe(false);
    expect(
      collaboratorPerms.can(ActionType.Manage, SubjectType.Workspace, workspace)
    ).toBe(false);
  });

  it('A workspace admin can fully manage a page of his workspace', () => {
    const adminUser = {
      id: 'adminUserId',
    };
    const adminPerms = new Permissions(adminUser, config);
    const hisWorkspace = {
      id: 'hisWorkspaceId',
      createdBy: 'someOtherAdminId',
      permissions: {
        [adminUser.id]: {
          role: Role.Admin,
        },
      },
    } as Subject;

    const page = {
      id: 'pageId',
      workspaceId: 'hisWorkspaceId',
    } as any as Subject;

    // We cannot read this page until parent workspace permissions are loaded :
    expect(adminPerms.can(ActionType.Read, SubjectType.Page, page)).toBe(false);

    // We must first load this workspace permissions !
    adminPerms.pullRoleFromSubject(SubjectType.Workspace, hisWorkspace);

    // The admin now can create a page within its workspace
    expect(adminPerms.can(ActionType.Create, SubjectType.Page, page)).toBe(
      true
    );
    // He also can read it
    expect(adminPerms.can(ActionType.Read, SubjectType.Page, page)).toBe(true);
  });

  it('A workspace admin cannot create nor read a page from another workspace', () => {
    const adminUser = {
      id: 'adminUserId',
    };
    const adminPerms = new Permissions(adminUser, config);
    const hisWorkspace = {
      id: 'hisWorkspaceId',
      createdBy: 'someOtherAdminId',
      permissions: {
        [adminUser.id]: {
          role: Role.Admin,
        },
      },
    } as Subject;
    adminPerms.pullRoleFromSubject(SubjectType.Workspace, hisWorkspace);

    const page = {
      id: 'pageId',
      workspaceId: 'someOtherWorkspace',
    } as any as Subject;

    // The admin can't create a page within this workspace
    expect(adminPerms.can(ActionType.Create, SubjectType.Page, page)).toBe(
      false
    );
    // He can't read it either
    expect(adminPerms.can(ActionType.Read, SubjectType.Page, page)).toBe(false);
  });

  it('Any admin can grant a specific role to someone else on its own workspace', () => {
    const adminUser = { id: 'adminUserId' };
    const futureCollaboratorUser = {
      id: 'futureCollaboratorUserId',
    };
    const adminPerms = new Permissions(adminUser, config);
    const futureCollaboratorPerms = new Permissions(
      futureCollaboratorUser,
      config
    );
    const adminWorkspace = {
      id: 'hisWorkspaceId',
      createdBy: 'someOtherGuy',
      permissions: {
        [adminUser.id]: {
          role: Role.Admin,
        },
      },
    } as Subject;
    adminPerms.pullRoleFromSubject(SubjectType.Workspace, adminWorkspace);

    let sharedWorkspace: Subject;
    expect(() => {
      sharedWorkspace = adminPerms.grant(
        Role.Collaborator,
        SubjectType.Workspace,
        adminWorkspace,
        futureCollaboratorUser
      ) as any as Subject;
    }).not.toThrow();

    expect(sharedWorkspace!!.permissions).toMatchObject({
      [futureCollaboratorUser.id]: {
        role: Role.Collaborator,
      },
    });

    expect(
      futureCollaboratorPerms.can(
        ActionType.Read,
        SubjectType.Workspace,
        sharedWorkspace!!
      )
    ).toBe(true);
  });
});
