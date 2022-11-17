import { defaultStyles, PagesProvider } from './PagesProvider';
import renderer, { act } from 'react-test-renderer';
import { pagesContext } from './context';
import api from '../../utils/api';

jest.mock('./context', () => ({
  pagesContext: {
    Provider: function Provider() {
      return null;
    },
  },
}));

jest.mock('../../utils/api', () => ({
  getPages: jest.fn(() => [
    {
      id: '123',
    },
  ]),
  updateApiKey: jest.fn(() => 'api key'),
  generateApiKey: jest.fn(() => 'api key'),
  updatePage: jest.fn((wid, page) => page),
  createPage: jest.fn((wid, page) => ({ ...page, id: '123' })),
  deletePage: jest.fn((wid, pid) => ({ id: pid })),
}));

it('should fetch pages', async () => {
  const root = renderer.create(<PagesProvider />);
  const child = root.root.children[0] as renderer.ReactTestInstance;
  expect(child.props.value.pages).toBeInstanceOf(Map);
  expect(child.props.value.pages.size).toBe(0);

  await act(async () => {
    await child.props.value.fetchPages('42');
  });

  expect(api.getPages).toHaveBeenCalledWith('42');
  expect(child.props.value.pages.size).toBe(1);
  expect(child.props.value.pages.get('42')).toEqual(new Set([{ id: '123' }]));
});

it('should create page', async () => {
  const root = renderer.create(<PagesProvider />);
  const child = root.root.children[0] as renderer.ReactTestInstance;

  await act(async () => {
    await child.props.value.createPage('42', {});
  });

  expect(api.createPage).toHaveBeenCalledWith('42', { styles: defaultStyles });

  expect(Array.from(child.props.value.pages.get('42').values())[0]).toEqual({
    id: '123',
    styles: defaultStyles,
    workspaceId: '42',
  });
});

it('should save page', async () => {
  const root = renderer.create(<PagesProvider />);
  const child = root.root.children[0] as renderer.ReactTestInstance;
  await act(async () => {
    await child.props.value.savePage('42', { id: '123' }, []);
  });
  expect(api.generateApiKey).toHaveBeenCalledWith(
    '42',
    ['*'],
    ['image/*', 'application/*', 'audio/*', 'video/*', 'text/*']
  );
  expect(api.updatePage).toHaveBeenCalledWith('42', {
    id: '123',
    apiKey: 'api key',
  });

  await act(async () => {
    await child.props.value.savePage(
      '42',
      { id: '123', apiKey: 'api key' },
      []
    );
  });

  expect(api.updateApiKey).toHaveBeenCalledWith(
    '42',
    'api key',
    ['*'],
    ['image/*', 'application/*', 'audio/*', 'video/*', 'text/*']
  );

  expect(child.props.value.pages.get('42').size).toBe(1);
  expect(Array.from(child.props.value.pages.get('42').values())[0]).toEqual({
    id: '123',
    apiKey: 'api key',
    workspaceId: '42',
  });
});

it('should delete page', async () => {
  const root = renderer.create(<PagesProvider />);
  const child = root.root.children[0] as renderer.ReactTestInstance;
  await act(async () => {
    child.props.value.pages.set('42', new Set([{ id: '123' }, { id: '456' }]));
    await child.props.value.deletePage('42', '123');
  });

  expect(api.deletePage).toHaveBeenCalledWith('42', '123');
  expect(child.props.value.pages.get('42').size).toBe(1);
  expect(Array.from(child.props.value.pages.get('42').values())[0]).toEqual({
    id: '456',
  });
});
