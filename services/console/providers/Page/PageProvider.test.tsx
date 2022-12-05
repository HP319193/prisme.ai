import renderer, { act } from 'react-test-renderer';

import { workspaceContext } from '../Workspace';
import workspaceContextValue from '../Workspace/workspaceContextValue.mock';
import api from '../../utils/api';
import { PageContext, PageProvider, usePage } from './PageProvider';

jest.mock('../../utils/api', () => {
  const mock = {
    getPage: jest.fn((workspaceId: string, id: string) => ({
      id,
      slug: 'my-page',
      name: 'My Page',
    })),
    getPageBySlug: jest.fn((w: string, slug: string) => ({
      id: '124',
      slug,
      name: slug,
    })),
    updatePage: jest.fn((workspaceId: string, data: any) => data),
    deletePage: jest.fn(),
  };
  return mock;
});

it('should render', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <PageProvider workspaceId={workspaceContextValue.workspace.id} id="42">
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
      <PageProvider workspaceId={workspaceContextValue.workspace.id} id="123">
        <T />
      </PageProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });
  expect(context.loading).toBe(false);
  expect(context.page).toEqual({
    id: '123',
    slug: 'my-page',
    name: 'My Page',
  });
});

it('should fetch page by slug', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <PageProvider workspaceSlug="my-workspace" slug="my-page">
        <T />
      </PageProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });
  expect(context.loading).toBe(false);
  expect(context.page).toEqual({
    id: '124',
    slug: 'my-page',
    name: 'my-page',
  });
});

it('should refetch page', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <PageProvider workspaceId={workspaceContextValue.workspace.id} id="123">
        <T />
      </PageProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  expect(api.getPage).toHaveBeenCalledWith('42', '123');
  (api.getPage as jest.Mock).mockClear();

  await act(async () => {
    const page = await context.fetchPage();
    expect(page).toEqual({
      id: '123',
      slug: 'my-page',
      name: 'My Page',
    });
  });
  expect(api.getPage).toHaveBeenCalledWith('42', '123');
});

it('should save page', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <PageProvider workspaceId={workspaceContextValue.workspace.id} id="123">
        <T />
      </PageProvider>
    </workspaceContext.Provider>
  );
  await act(async () => {
    await true;
  });

  await act(async () => {
    const newPage = await context.savePage({
      id: '123',
      slug: 'my-new-page',
      name: 'My new Page',
    });
    expect(newPage).toEqual({
      id: '123',
      slug: 'my-new-page',
      name: 'My new Page',
    });
  });
  expect(api.updatePage).toHaveBeenCalledWith('42', {
    id: '123',
    slug: 'my-new-page',
    name: 'My new Page',
  });
});

it('should delete page', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <PageProvider workspaceId={workspaceContextValue.workspace.id} id="123">
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
      id: '123',
      slug: 'my-page',
      name: 'My Page',
    });
  });
  expect(api.deletePage).toHaveBeenCalledWith('42', '123');
});
