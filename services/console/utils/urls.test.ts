import { generateEndpoint, usePageEndpoint } from './urls';

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    ENDPOINT:
      'http://localhost:3000/api/workspaces/{{workspaceId}}/webhooks/{{slug}}',
    PAGES_HOST: 'http://localhost:3000/{{lang}}/pages',
  },
}));

it('should generate endpoint', () => {
  expect(generateEndpoint('42', 'hello')).toBe(
    'http://localhost:3000/api/workspaces/42/webhooks/hello'
  );
});

it('should get pages host', () => {
  expect(usePageEndpoint()).toBe('http://localhost:3000/en/pages');
});
