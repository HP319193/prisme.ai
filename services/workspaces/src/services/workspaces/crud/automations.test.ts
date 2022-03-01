import Automations from './automations';
import '@prisme.ai/types';
import { ObjectNotFoundError } from '../../../errors';

jest.mock('nanoid', () => ({ nanoid: () => '123456' }));

const EMPTY_WORKSPACE_ID = '123456';
const INIT_WORKSPACE_ID = '123456_INIT';
const INI_AUTOMATION_SLUG = 'My automated';

const workspaces = {
  [EMPTY_WORKSPACE_ID]: {
    name: 'nameWorkspace',
    id: EMPTY_WORKSPACE_ID,
  },
  [INIT_WORKSPACE_ID]: {
    name: 'nameWorkspaceInitialized',
    id: INIT_WORKSPACE_ID,
    automations: {
      [INI_AUTOMATION_SLUG]: {
        name: 'My automatéd: /',
        do: [],
      },
    },
  },
};
const getMockedWorkspaces = () => ({
  getWorkspace: jest.fn((workspaceId) => workspaces[workspaceId]),
  save: jest.fn(),
});
const getMockedBroker = () => ({ send: jest.fn() });

it('createAutomation should call Workspaces crud & broker', async () => {
  const mockedWorkspaces: any = getMockedWorkspaces();
  const mockedBroker: any = getMockedBroker();

  const workspaceCrud = new Automations(mockedWorkspaces, mockedBroker);

  const automation = {
    name: 'My automatéd: /',
    do: [],
  };
  const result = await workspaceCrud.createAutomation(
    EMPTY_WORKSPACE_ID,
    automation
  );

  expect(result.slug).toBe('My automated');
  expect(mockedWorkspaces.save).toHaveBeenCalledWith(EMPTY_WORKSPACE_ID, {
    ...workspaces[EMPTY_WORKSPACE_ID],
    automations: {
      [result.slug]: automation,
    },
  });
  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.automation.created',
    {
      slug: result.slug,
      automation,
    }
  );
});

it('updateAutomation should call Workspaces crud & broker', async () => {
  const mockedWorkspaces: any = getMockedWorkspaces();
  const mockedBroker: any = getMockedBroker();

  const workspaceCrud = new Automations(mockedWorkspaces, mockedBroker);

  const automation = {
    name: 'renamed automét !',
    do: [
      {
        set: {
          name: 'someVar',
          value: 'someValue',
        },
      },
    ],
  };
  const result = await workspaceCrud.updateAutomation(
    INIT_WORKSPACE_ID,
    INI_AUTOMATION_SLUG,
    automation
  );

  expect(result).toMatchObject({ ...automation, slug: INI_AUTOMATION_SLUG });
  expect(mockedWorkspaces.save).toHaveBeenCalledWith(INIT_WORKSPACE_ID, {
    ...workspaces[INIT_WORKSPACE_ID],
    automations: {
      [result.slug]: automation,
    },
  });
  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.automation.updated',
    {
      slug: result.slug,
      automation,
    }
  );
});

it('updateAutomation should throw ObjectNotFound', async () => {
  const mockedWorkspaces: any = getMockedWorkspaces();
  const mockedBroker: any = getMockedBroker();

  const workspaceCrud = new Automations(mockedWorkspaces, mockedBroker);

  expect(
    workspaceCrud.updateAutomation(INIT_WORKSPACE_ID, 'someUnknownAutomation', {
      name: '',
      do: [],
    })
  ).rejects.toThrow(ObjectNotFoundError);
});

it('deleteAutomation should call Workspaces crud & broker', async () => {
  const mockedWorkspaces: any = getMockedWorkspaces();
  const mockedBroker: any = getMockedBroker();

  const workspaceCrud = new Automations(mockedWorkspaces, mockedBroker);

  await workspaceCrud.deleteAutomation(INIT_WORKSPACE_ID, INI_AUTOMATION_SLUG);

  expect(mockedWorkspaces.save).toHaveBeenCalledWith(INIT_WORKSPACE_ID, {
    ...workspaces[INIT_WORKSPACE_ID],
    automations: {},
  });
  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.automation.deleted',
    {
      automation: {
        slug: INI_AUTOMATION_SLUG,
        name: workspaces[INIT_WORKSPACE_ID].automations[INI_AUTOMATION_SLUG]
          .name,
      },
    }
  );
});
