import Provider from './Provider';
import renderer, { act } from 'react-test-renderer';
import api from '../../utils/api';
import { usePermissions } from './context';

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
          target: {
            id: '42',
            email: 'user@tropfort.com',
          },
          permissions: {
            role: 'owner',
          },
        },
        {
          target: {
            id: '43',
            email: 'user2@tropfort.com',
          },
          permissions: {
            role: 'editor',
          },
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
        'workspaces:workspaceId11',
        [
          {
            target: {
              id: '42',
              email: 'user@tropfort.com',
            },
            permissions: {
              role: 'owner',
            },
          },
          {
            target: {
              id: '43',
              email: 'user2@tropfort.com',
            },
            permissions: {
              role: 'editor',
            },
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
          target: {
            id: '42',
            email: 'user@tropfort.com',
          },
          permissions: {
            role: 'owner',
          },
        },
        {
          target: {
            id: '43',
            email: 'user2@tropfort.com',
          },
          permissions: {
            role: 'editor',
          },
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
  jest.spyOn(api, 'addPermissions').mockReturnValue(
    Promise.resolve({
      target: {
        id: '44',
        email: 'user3@tropfort.com',
      },
      permissions: {
        role: 'editor',
      },
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
        target: {
          id: '44',
        },
        permissions: {
          role: 'owner',
        },
      }
    );
    expect(api.addPermissions).toHaveBeenCalledWith(
      'workspaces',
      'workspaceId11',
      {
        target: {
          id: '44',
        },
        permissions: {
          role: 'owner',
        },
      }
    );
    expect(expected).toEqual({
      target: {
        id: '44',
        email: 'user3@tropfort.com',
      },
      permissions: {
        role: 'editor',
      },
    });
  });

  await act(async () => {
    await true;
  });
  expect(context.usersPermissions).toEqual(
    new Map([
      [
        'workspaces:workspaceId11',
        [
          {
            target: {
              id: '44',
              email: 'user3@tropfort.com',
            },
            permissions: {
              role: 'editor',
            },
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
          target: {
            id: '42',
            email: 'user@tropfort.com',
          },
          permissions: {
            role: 'owner',
          },
        },
        {
          target: {
            id: '43',
            email: 'user2@tropfort.com',
          },
          permissions: {
            role: 'editor',
          },
        },
      ],
    } as any)
  );
  jest.spyOn(api, 'addPermissions').mockReturnValue(
    Promise.resolve({
      target: {
        id: '44',
        email: 'user3@tropfort.com',
      },
      permissions: {
        role: 'editor',
      },
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
        target: {
          id: '44',
        },
        permissions: {
          role: 'owner',
        },
      }
    );
    expect(api.addPermissions).toHaveBeenCalledWith(
      'workspaces',
      'workspaceId11',
      {
        target: {
          id: '44',
        },
        permissions: {
          role: 'owner',
        },
      }
    );
    expect(expected).toEqual({
      target: {
        id: '44',
        email: 'user3@tropfort.com',
      },
      permissions: {
        role: 'editor',
      },
    });
  });

  await act(async () => {
    await true;
  });
  expect(context.usersPermissions).toEqual(
    new Map([
      [
        'workspaces:workspaceId11',
        [
          {
            target: {
              id: '42',
              email: 'user@tropfort.com',
            },
            permissions: {
              role: 'owner',
            },
          },
          {
            target: {
              id: '43',
              email: 'user2@tropfort.com',
            },
            permissions: {
              role: 'editor',
            },
          },
          {
            target: {
              id: '44',
              email: 'user3@tropfort.com',
            },
            permissions: {
              role: 'editor',
            },
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
          target: {
            id: '42',
            email: 'user@tropfort.com',
          },
          permissions: {
            role: 'owner',
          },
        },
        {
          target: {
            id: '43',
            email: 'user2@tropfort.com',
          },
          permissions: {
            role: 'editor',
          },
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
    await context.removeUserPermissions('workspaces', 'workspaceId11', {
      id: '43',
    });
    expect(api.deletePermissions).toHaveBeenCalledWith(
      'workspaces',
      'workspaceId11',
      '43'
    );
  });

  await act(async () => {
    await true;
  });

  expect(context.usersPermissions).toEqual(
    new Map([
      [
        'workspaces:workspaceId11',
        [
          {
            target: {
              id: '42',
              email: 'user@tropfort.com',
            },
            permissions: {
              role: 'owner',
            },
          },
        ],
      ],
    ])
  );
});
