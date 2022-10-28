import { generateEndpoint, getSubmodain, usePageEndpoint } from './urls';
// @ts-ignore
import { mock } from '../components/WorkspaceProvider';

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    API_HOST: 'https://api',
    PAGES_HOST: '.pages.prisme.ai',
  },
}));

jest.mock('../components/WorkspaceProvider', () => {
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
  expect(usePageEndpoint()).toBe('https://my.website.pages.prisme.ai/en');

  mock.slug = '';
  expect(usePageEndpoint()).toBe('');
});

it('should get subdomain', () => {
  expect(getSubmodain('my.website.pages.prisme.ai')).toBe('my.website');
});
