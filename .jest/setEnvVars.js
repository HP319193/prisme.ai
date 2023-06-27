// Make sure you can use "publicRuntimeConfig" within tests.
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    API_URL: 'http://localhost:3000/api',
    ENDPOINT:
      'http://localhost:3000/api/workspace/{{workspaceId}}/webhook/{{slug}}',
  },
}));

// For packages/permissions:
if (typeof window.TextEncoder === 'undefined') {
  const { TextEncoder } = require('util');
  window.TextEncoder = TextEncoder;
}

if (typeof window.TextDecoder === 'undefined') {
  const { TextDecoder } = require('util');
  window.TextDecoder = TextDecoder;
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
