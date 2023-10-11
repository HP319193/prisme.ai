import renderer, { act } from 'react-test-renderer';

import { useWorkspace, WorkspaceContext, workspaceContext } from '../Workspace';
import workspaceContextValue from '../Workspace/workspaceContextValue.mock';
import api from '../../utils/api';
import { BlockContext, BlockProvider, useBlock } from './BlockProvider';

jest.mock('../../utils/api', () => {
  const mock = {
    getWorkspace: jest.fn((workspaceId: string, slug: string) => ({
      blocks: {
        'my-block': {
          name: 'My Block',
          blocks: [
            {
              slug: 'RichText',
              content: 'Hello World',
            },
          ],
        },
      },
    })),
  };
  return mock;
});

it('should render', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <BlockProvider
        workspaceId={workspaceContextValue.workspace.id}
        slug="my-block"
      >
        Foo
      </BlockProvider>
    </workspaceContext.Provider>
  );

  await act(async () => {
    await true;
  });

  expect(root.toJSON()).toMatchSnapshot();
});

let context: BlockContext;
let wContext: WorkspaceContext;
const T = () => {
  context = useBlock();
  wContext = useWorkspace();
  return null;
};

it('should fetch Block', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <BlockProvider
        workspaceId={workspaceContextValue.workspace.id}
        slug="my-block"
      >
        <T />
      </BlockProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });
  expect(context.loading).toBe(false);
  expect(context.block).toEqual({
    name: 'My Block',
    slug: 'my-block',
    blocks: [
      {
        slug: 'RichText',
        content: 'Hello World',
      },
    ],
  });
});

it('should refetch Block', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <BlockProvider
        workspaceId={workspaceContextValue.workspace.id}
        slug="my-block"
      >
        <T />
      </BlockProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  expect(api.getWorkspace).toHaveBeenCalledWith(
    workspaceContextValue.workspace.id
  );
  (api.getWorkspace as jest.Mock).mockClear();

  await act(async () => {
    const block = await context.fetchBlock();
    expect(block).toEqual({
      name: 'My Block',
      slug: 'my-block',
      blocks: [
        {
          slug: 'RichText',
          content: 'Hello World',
        },
      ],
    });
  });
  expect(api.getWorkspace).toHaveBeenCalledWith(
    workspaceContextValue.workspace.id
  );
});

it('should save Block', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <BlockProvider
        workspaceId={workspaceContextValue.workspace.id}
        slug="my-block"
      >
        <T />
      </BlockProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    const newBlock = await context.saveBlock({
      slug: 'my-new-block',
      name: 'My new Block',
    });

    expect(newBlock).toEqual({
      slug: 'my-new-block',
      name: 'My new Block',
    });
  });

  expect(wContext.saveWorkspace).toHaveBeenCalledWith({
    id: '42',
    blocks: {
      'my-new-block': {
        name: 'My new Block',
      },
    },
  });
});

it('should delete Block', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <BlockProvider
        workspaceId={workspaceContextValue.workspace.id}
        slug="my-block"
      >
        <T />
      </BlockProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    const deleted = await context.deleteBlock();
    expect(deleted).toEqual({
      slug: 'my-block',
      name: 'My Block',
      blocks: [
        {
          slug: 'RichText',
          content: 'Hello World',
        },
      ],
    });
  });
  expect(wContext.saveWorkspace).toHaveBeenCalledWith({
    id: '42',
    blocks: {},
  });
});
