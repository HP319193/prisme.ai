import { AlreadyUsedError, ObjectNotFoundError } from '../../errors';
import { DSULStorage } from './DSULStorage';
import { DSULType } from './types';
import { MockStorage } from './__mocks__';

const WORKSPACE_ID = 'workspaceId';

describe('Store basic metadata inside the folder index', () => {
  let storage: DSULStorage;
  let lastFolderIndex: Record<string, any>;

  beforeAll(() => {
    storage = new MockStorage(DSULType.Automations);
  });

  it('Maintains the FolderIndex updated on each create', async () => {
    await storage.save(
      {
        workspaceId: WORKSPACE_ID,
        slug: 'firstAutom',
        dsulType: DSULType.Automations,
      },
      {
        name: 'My first autom',
        slug: 'firstAutom',
        do: [],
      },
      {
        mode: 'create',
      }
    );

    await storage.save(
      {
        workspaceId: WORKSPACE_ID,
        slug: 'secondAutom',
        dsulType: DSULType.Automations,
      },
      {
        name: 'My second autom',
        slug: 'secondAutom',
        do: [],
      },
      {
        mode: 'create',
      }
    );

    const folderIndex1 = await storage.folderIndex({
      dsulType: DSULType.Automations,
      workspaceId: WORKSPACE_ID,
    });
    lastFolderIndex = {
      firstAutom: {
        name: 'My first autom',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      secondAutom: {
        name: 'My second autom',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    };
    expect(folderIndex1).toEqual(lastFolderIndex);
  });

  it('Maintains the FolderIndex updated on each update', async () => {
    await storage.save(
      {
        workspaceId: WORKSPACE_ID,
        slug: 'firstAutom',
        dsulType: DSULType.Automations,
      },
      {
        name: 'My first autom',
        description: 'Some description',
        slug: 'firstAutom',
        do: [],
      },
      {
        mode: 'update',
      }
    );

    const folderIndex2 = await storage.folderIndex({
      dsulType: DSULType.Automations,
      workspaceId: WORKSPACE_ID,
    });
    lastFolderIndex = {
      ...lastFolderIndex,
      firstAutom: {
        ...lastFolderIndex.firstAutom,
        description: 'Some description',
      },
    };
    expect(folderIndex2).toEqual(lastFolderIndex);
  });

  it('Maintains the FolderIndex updated on each delete', async () => {
    await storage.delete({
      workspaceId: WORKSPACE_ID,
      slug: 'secondAutom',
      dsulType: DSULType.Automations,
    });

    const folderIndex3 = await storage.folderIndex({
      dsulType: DSULType.Automations,
      workspaceId: WORKSPACE_ID,
    });
    delete lastFolderIndex['secondAutom'];

    expect(folderIndex3).toEqual(lastFolderIndex);
  });

  it('Maintains the FolderIndex updated on a slug renaming', async () => {
    await storage.save(
      {
        workspaceId: WORKSPACE_ID,
        slug: 'firstAutom',
        dsulType: DSULType.Automations,
      },
      {
        name: 'My first autom',
        description: 'Some description',
        slug: 'newSlug',
        do: [],
      },
      {
        mode: 'update',
      }
    );
    const folderIndex4 = await storage.folderIndex({
      dsulType: DSULType.Automations,
      workspaceId: WORKSPACE_ID,
    });
    const { firstAutom, ...rest } = lastFolderIndex;
    lastFolderIndex = {
      ...rest,
      newSlug: firstAutom,
    };

    expect(folderIndex4).toEqual(lastFolderIndex);
  });
});

describe('Slug availability checks', () => {
  let storage: DSULStorage;

  beforeEach(() => {
    storage = new MockStorage(DSULType.DSULIndex);
  });

  it('Throws ObjectNotFoundError on get/update/delete', async () => {
    await expect(
      storage.save(
        {
          workspaceId: WORKSPACE_ID,
          slug: 'SomeUnknownSlug',
          dsulType: DSULType.Pages,
        },
        {} as any,
        {
          mode: 'update',
        }
      )
    ).rejects.toThrowError(ObjectNotFoundError);

    await expect(
      storage.get({
        workspaceId: WORKSPACE_ID,
        slug: 'someUNknownSlug',
        dsulType: DSULType.Pages,
      })
    ).rejects.toThrowError(ObjectNotFoundError);

    await expect(
      storage.delete({
        workspaceId: WORKSPACE_ID,
        slug: 'myAwesomeImport',
        dsulType: DSULType.Imports,
      })
    ).rejects.toThrowError(ObjectNotFoundError);
  });

  it('Throws AlreadyUsedError on create & slug renaming', async () => {
    // Test 1 :We cannot create another page with the same slug
    await storage.save(
      {
        workspaceId: WORKSPACE_ID,
        slug: 'myPage',
        dsulType: DSULType.Pages,
      },
      {
        name: 'My first page',
      },
      {
        mode: 'create',
      }
    );
    await expect(
      storage.save(
        {
          workspaceId: WORKSPACE_ID,
          slug: 'myPage',
          dsulType: DSULType.Pages,
        },
        {
          name: 'My first page',
        },
        {
          mode: 'create',
        }
      )
    ).rejects.toThrowError(AlreadyUsedError);

    // Test 2 : We cannot rename a page to some other slug already in use
    await storage.save(
      {
        workspaceId: WORKSPACE_ID,
        slug: 'mySecondPage',
        dsulType: DSULType.Pages,
      },
      {
        name: 'My first page',
        slug: 'mySecondPage',
      },
      {
        mode: 'create',
      }
    );

    await expect(
      storage.save(
        {
          workspaceId: WORKSPACE_ID,
          slug: 'myPage',
          dsulType: DSULType.Pages,
        },
        {
          name: 'My first page',
          slug: 'mySecondPage',
        },
        {
          mode: 'update',
        }
      )
    ).rejects.toThrowError(AlreadyUsedError);
  });
});
