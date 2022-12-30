import {
  generateEndpoint,
  getSubmodain,
  replaceSilently,
  usePageEndpoint,
} from './urls';
// @ts-ignore
import { mock } from '../providers/Workspace';

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    API_HOST: 'https://api',
    PAGES_HOST: '.pages.prisme.ai',
  },
}));

jest.mock('../providers/Workspace', () => {
  const mock = {
    slug: 'my.website',
  };
  return {
    mock,
    useWorkspace: () => ({
      workspace: mock,
    }),
  };
});

it('should generate endpoint', () => {
  expect(generateEndpoint('42', 'hello')).toBe(
    'https://api/workspaces/42/webhooks/hello'
  );
});

it('should get pages host', () => {
  expect(usePageEndpoint()).toBe('http://my.website.pages.prisme.ai/en');

  mock.slug = '';
  expect(usePageEndpoint()).toBe('');
});

it('should get subdomain', () => {
  expect(getSubmodain('my.website.pages.prisme.ai')).toBe('my.website');
});

it('should replace silently current url', () => {
  const replaceState = jest.fn();
  window.history.replaceState = replaceState;
  // @ts-ignore
  delete window.location;
  window.location = { pathname: '/fr/foo/bar' } as Location;
  replaceSilently('/somewhere/else');
  expect(replaceState).toBeCalledWith({}, '', '/fr/somewhere/else');
});
