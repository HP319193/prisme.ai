import Provider from './Provider';
import renderer, { act } from 'react-test-renderer';
import api from '../../api/api';
import { usePermissions } from '.';

jest.mock('../WorkspacesProvider', () => {
  const mock = {
    user: {},
  };
  return {
    useUser: () => mock,
  };
});

beforeEach(() => {
  jest.resetAllMocks();
});

it('should access context', async () => {
  let context: any = {};
  const Test = () => {
    context = usePermissions();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  expect(context.usersPermissions).toEqual(new Map());
  expect(context.getUsersPermissions).toBeInstanceOf(Function);
  expect(context.addUserPermissions).toBeInstanceOf(Function);
  expect(context.removeUserPermissions).toBeInstanceOf(Function);
});

it('should fetch userPermissions', async () => {
  jest.spyOn(api, 'getPermissions').mockReturnValue(
    Promise.resolve({
      result: [
        {
          id: '42',
          email: 'user@tropfort.com',
          role: 'owner',
        },
        {
          id: '43',
          email: 'user2@tropfort.com',
          role: 'editor',
        },
      ],
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = usePermissions();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    // TODO store object type in addition to id in provider
    await context.getUsersPermissions('workspaces', 'workspaceId11');
  });

  expect(api.getPermissions).toHaveBeenCalled();
  expect(context.usersPermissions).toEqual(
    new Map([
      [
        'workspaceId11',
        [
          {
            id: '42',
            email: 'user@tropfort.com',
            role: 'owner',
          },
          {
            id: '43',
            email: 'user2@tropfort.com',
            role: 'editor',
          },
        ],
      ],
    ])
  );
});

it('should not fetch workspaces', async () => {
  jest.spyOn(api, 'getPermissions').mockReturnValue(
    Promise.resolve({
      result: [
        {
          id: '42',
          email: 'user@tropfort.com',
          role: 'owner',
        },
        {
          id: '43',
          email: 'user2@tropfort.com',
          role: 'editor',
        },
      ],
    } as any)
  );

  let context: any = {};
  const Test = () => {
    context = usePermissions();
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
  expect(api.getPermissions).not.toHaveBeenCalled();
  expect(context.usersPermissions).toEqual(new Map());
});

it('should give user permissions', async () => {
  jest.spyOn(api, 'postPermissions').mockReturnValue(
    Promise.resolve({
      id: '44',
      email: 'user3@tropfort.com',
      role: 'editor',
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = usePermissions();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    const expected = await context.addUserPermissions(
      'workspaces',
      'workspaceId11',
      {
        id: '44',
        role: 'owner',
      }
    );
    expect(api.postPermissions).toHaveBeenCalledWith(
      'workspaces',
      'workspaceId11',
      {
        id: '44',
        role: 'owner',
      }
    );
    expect(expected).toEqual({
      id: '44',
      email: 'user3@tropfort.com',
      role: 'editor',
    });
  });

  await act(async () => {
    await true;
  });
  expect(context.usersPermissions).toEqual(
    new Map([
      [
        'workspaceId11',
        [
          {
            id: '44',
            email: 'user3@tropfort.com',
            role: 'editor',
          },
        ],
      ],
    ])
  );
});

it("should add user to provider's list", async () => {
  jest.spyOn(api, 'getPermissions').mockReturnValue(
    Promise.resolve({
      result: [
        {
          id: '42',
          email: 'user@tropfort.com',
          role: 'owner',
        },
        {
          id: '43',
          email: 'user2@tropfort.com',
          role: 'editor',
        },
      ],
    } as any)
  );
  jest.spyOn(api, 'postPermissions').mockReturnValue(
    Promise.resolve({
      id: '44',
      email: 'user3@tropfort.com',
      role: 'editor',
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = usePermissions();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );

  await act(async () => {
    await context.getUsersPermissions('workspaces', 'workspaceId11');
  });

  await act(async () => {
    const expected = await context.addUserPermissions(
      'workspaces',
      'workspaceId11',
      {
        id: '44',
        role: 'owner',
      }
    );
    expect(api.postPermissions).toHaveBeenCalledWith(
      'workspaces',
      'workspaceId11',
      {
        id: '44',
        role: 'owner',
      }
    );
    expect(expected).toEqual({
      id: '44',
      email: 'user3@tropfort.com',
      role: 'editor',
    });
  });

  await act(async () => {
    await true;
  });
  expect(context.usersPermissions).toEqual(
    new Map([
      [
        'workspaceId11',
        [
          {
            id: '42',
            email: 'user@tropfort.com',
            role: 'owner',
          },
          {
            id: '43',
            email: 'user2@tropfort.com',
            role: 'editor',
          },
          {
            id: '44',
            email: 'user3@tropfort.com',
            role: 'editor',
          },
        ],
      ],
    ])
  );
});

it("should remove a user's permissions", async () => {
  jest.spyOn(api, 'deletePermissions').mockReturnValue({} as any);
  jest.spyOn(api, 'getPermissions').mockReturnValue(
    Promise.resolve({
      result: [
        {
          id: '42',
          email: 'user@tropfort.com',
          role: 'owner',
        },
        {
          id: '43',
          email: 'user2@tropfort.com',
          role: 'editor',
        },
      ],
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = usePermissions();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );

  await act(async () => {
    await context.getUsersPermissions('workspaces', 'workspaceId11');
  });

  await act(async () => {
    await context.removeUserPermissions(
      'workspaces',
      'workspaceId11',
      'user2@tropfort.com'
    );
    expect(api.deletePermissions).toHaveBeenCalledWith(
      'workspaces',
      'workspaceId11',
      'user2@tropfort.com'
    );
  });

  await act(async () => {
    await true;
  });

  expect(context.usersPermissions).toEqual(
    new Map([
      [
        'workspaceId11',
        [
          {
            id: '42',
            email: 'user@tropfort.com',
            role: 'owner',
          },
        ],
      ],
    ])
  );
});
