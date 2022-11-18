import { DSULType, getPath } from './DSULStorage';

describe('Workspaces & Apps pathes', () => {
  it('getPath can return base workspace/app directory (needed by delete workspace/app)', () => {
    // Legacy
    expect(
      getPath(DSULType.DSULIndex, {
        workspaceId: 'myWorkspaceId',
        parentFolder: true,
      })
    ).toEqual(`workspaces/myWorkspaceId`);
    expect(
      getPath(DSULType.DSULIndex, {
        appSlug: 'myAppId',
        parentFolder: true,
      })
    ).toEqual(`apps/myAppId`);

    expect(
      getPath(DSULType.DSULIndex, {
        workspaceId: 'myWorkspaceId',
        parentFolder: true,
      })
    ).toEqual(`workspaces/myWorkspaceId`);

    expect(
      getPath(DSULType.DSULIndex, {
        appSlug: 'myAppId',
        parentFolder: true,
      })
    ).toEqual(`apps/myAppId`);
  });

  it('getPath can return workspace/app version folder (needed by delete workspace/app version)', () => {
    expect(
      getPath(DSULType.DSULIndex, {
        workspaceId: 'myWorkspaceId',
        version: 'someVersion',
        parentFolder: true,
      })
    ).toEqual('workspaces/myWorkspaceId/versions/someVersion');
  });

  it('getPath can return workspace index (needed by get workspace)', () => {
    // Legacy
    expect(
      getPath(DSULType.DSULIndex, {
        workspaceId: 'myWorkspaceId',
        legacy: true,
      })
    ).toEqual('workspaces/myWorkspaceId/current.yml');
    expect(
      getPath(DSULType.DSULIndex, {
        appSlug: 'myAppId',
        legacy: true,
      })
    ).toEqual('apps/myAppId/current.yml');

    // Missing workspaceId
    expect(() => getPath(DSULType.DSULIndex, {})).toThrowError();

    expect(
      getPath(DSULType.DSULIndex, {
        workspaceId: 'myWorkspaceId',
      })
    ).toEqual('workspaces/myWorkspaceId/versions/current/index.yml');

    expect(
      getPath(DSULType.DSULIndex, {
        workspaceId: 'myWorkspaceId',
        version: 'current',
      })
    ).toEqual(`workspaces/myWorkspaceId/versions/current/index.yml`);

    expect(
      getPath(DSULType.DSULIndex, {
        workspaceId: 'myWorkspaceId',
        version: 'oldVersion',
      })
    ).toEqual(`workspaces/myWorkspaceId/versions/oldVersion/index.yml`);
  });
});

describe('Workspace automations pathes', () => {
  it('getPath can return automations directory (needed by list automations)', () => {
    expect(() =>
      getPath(DSULType.Automations, {
        slug: 'mySlug', // Missing workspaceId
      })
    ).toThrowError();

    expect(() =>
      getPath(DSULType.Automations, {
        workspaceId: 'myWorkspaceId',
      })
    ).toThrowError(); // Missing one of slug | parentFolder

    expect(
      // OK
      getPath(DSULType.Automations, {
        workspaceId: 'myWorkspaceId',
        parentFolder: true,
      })
    ).toEqual(`workspaces/myWorkspaceId/versions/current/automations`);
  });

  it('getPath can return automation file (needed by get automation)', () => {
    expect(() =>
      getPath(DSULType.Automations, {
        workspaceId: 'myWorkspaceId',
      })
    ).toThrowError();

    expect(
      getPath(DSULType.Automations, {
        workspaceId: 'myWorkspaceId',
        slug: 'myAutomation',
      })
    ).toEqual(
      `workspaces/myWorkspaceId/versions/current/automations/myAutomation.yml`
    );
  });

  it('getPath can return automations folder index file (needed by get workspace)', () => {
    expect(
      getPath(DSULType.Automations, {
        workspaceId: 'myWorkspaceId',
        folderIndex: true,
      })
    ).toEqual(
      `workspaces/myWorkspaceId/versions/current/automations/__index__.yml`
    );
  });
});

describe('App automations pathes', () => {
  it('getPath can return automations folder index file (needed by get app)', () => {
    expect(
      getPath(DSULType.Automations, {
        appSlug: 'myAppSlug',
        folderIndex: true,
      })
    ).toEqual(`apps/myAppSlug/versions/current/automations/__index__.yml`);
  });
});

describe('Detailed page pathes', () => {
  it('getPath can return the workspace folder of detailed pages (needed by detailedPage migration of workspaceSlug)', () => {
    expect(
      getPath(DSULType.DetailedPage, {
        parentFolder: true,
        workspaceSlug: 'myWorkspaceSlug',
      })
    ).toEqual(`pages/myWorkspaceSlug`);
  });

  it('getPath can return detailed page path (needed by pages rendering)', () => {
    expect(
      getPath(DSULType.DetailedPage, {
        slug: 'myPage',
        workspaceSlug: 'myWorkspaceSlug',
      })
    ).toEqual(`pages/myWorkspaceSlug/myPage.yml`);
  });
});
