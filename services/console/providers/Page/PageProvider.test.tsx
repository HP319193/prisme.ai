import renderer, { act } from 'react-test-renderer';

import { workspaceContext } from '../Workspace';
import workspaceContextValue from '../Workspace/workspaceContextValue.mock';
import api from '../../utils/api';
import { PageContext, PageProvider, usePage } from './PageProvider';

jest.mock('../../utils/api', () => {
  const mock = {
    getPage: jest.fn((workspaceId: string, slug: string) => ({
      slug,
      name: 'My Page',
    })),
    updatePage: jest.fn((workspaceId: string, data: any) => data),
    deletePage: jest.fn(),
  };
  return mock;
});

it('should render', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <PageProvider workspaceId={workspaceContextValue.workspace.id} slug="42">
        Foo
      </PageProvider>
    </workspaceContext.Provider>
  );

  await act(async () => {
    await true;
  });

  expect(root.toJSON()).toMatchSnapshot();
});

let context: PageContext;
const T = () => {
  context = usePage();
  return null;
};

it('should fetch page', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <PageProvider
        workspaceId={workspaceContextValue.workspace.id}
        slug="my-page"
      >
        <T />
      </PageProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });
  expect(context.loading).toBe(false);
  expect(context.page).toEqual({
    slug: 'my-page',
    name: 'My Page',
  });
});

it('should refetch page', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <PageProvider
        workspaceId={workspaceContextValue.workspace.id}
        slug="my-page"
      >
        <T />
      </PageProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  expect(api.getPage).toHaveBeenCalledWith('42', 'my-page');
  (api.getPage as jest.Mock).mockClear();

  await act(async () => {
    const page = await context.fetchPage();
    expect(page).toEqual({
      slug: 'my-page',
      name: 'My Page',
    });
  });
  expect(api.getPage).toHaveBeenCalledWith('42', 'my-page');
});

it('should save page', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <PageProvider
        workspaceId={workspaceContextValue.workspace.id}
        slug="my-page"
      >
        <T />
      </PageProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    const newPage = await context.savePage({
      slug: 'my-new-page',
      name: 'My new Page',
    });
    expect(newPage).toEqual({
      slug: 'my-new-page',
      name: 'My new Page',
    });
  });
  expect(api.updatePage).toHaveBeenCalledWith('42', {
    slug: 'my-new-page',
    name: 'My new Page',
  });
});

it('should delete page', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <PageProvider
        workspaceId={workspaceContextValue.workspace.id}
        slug="my-page"
      >
        <T />
      </PageProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    const deleted = await context.deletePage();
    expect(deleted).toEqual({
      slug: 'my-page',
      name: 'My Page',
    });
  });
  expect(api.deletePage).toHaveBeenCalledWith('42', 'my-page');
});
