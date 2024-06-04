const { i18n } = require('./next-i18next.config');

function jsonParse(env, dft = {}) {
  try {
    return JSON.parse(env) || {};
  } catch {
    return dft;
  }
}

function booleanParse(env) {
  return ['true', 'y', '1'].includes((env || '').toLowerCase());
}

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  i18n,
  publicRuntimeConfig: {
    API_URL: process.env.API_URL || process.env.API_HOST || '', // API_HOST deprecated, to remove once deployments updated
    CONSOLE_URL: process.env.CONSOLE_URL || process.env.CONSOLE_HOST || '', // CONSOLE_HOST deprecated, to remove once deployments updated
    INTERNAL_API_URL: process.env.INTERNAL_API_URL || '', // Optional. Useful to ensure prismeai-pages makes server-side calls using this url
    PAGES_HOST: process.env.PAGES_HOST || '',
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    HEADER_POPOVERS: process.env.HEADER_POPOVERS || '{}',
    SUGGESTIONS_ENDPOINT: process.env.SUGGESTIONS_ENDPOINT || '',
    BILLING_HOME: process.env.BILLING_HOME || '',
    BILLING_USAGE: process.env.BILLING_USAGE || '',
    TRACKING: jsonParse(process.env.TRACKING),
    TRACKING_WEBHOOK: process.env.TRACKING_WEBHOOK || '',
    PRODUCTS_ENDPOINT: process.env.PRODUCTS_ENDPOINT || '',
    OIDC_PROVIDER_URL:
      process.env.OIDC_PROVIDER_URL ||
      (process.env.API_URL && process.env.API_URL.replace('/v2', '')) ||
      'http://studio.local.prisme.ai:3001',
    OIDC_STUDIO_CLIENT_ID:
      process.env.OIDC_STUDIO_CLIENT_ID || 'local-client-id',
    OIDC_CLIENT_ID_HEADER:
      process.env.OIDC_CLIENT_ID_HEADER || 'x-prismeai-client-id',
    ENABLED_AUTH_PROVIDERS: jsonParse(
      process.env.ENABLED_AUTH_PROVIDERS,
      (process.env.ENABLED_AUTH_PROVIDERS || 'local')
        .split(',')
        .map((name) => ({ name }))
    ),
    DISABLE_SSR: booleanParse(process.env.DISABLE_SSR),

    // https://socket.io/docs/v3/client-initialization/#transports
    WEBSOCKETS_DEFAULT_TRANSPORTS: (
      process.env.WEBSOCKETS_DEFAULT_TRANSPORTS || 'polling,websocket'
    ).split(','),
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svgr$/i,
      issuer: /\.[jt]sx?$/,
      use: [{ loader: '@svgr/webpack', options: { icon: true } }],
    });
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
    };

    return config;
  },

  async headers() {
    const xFrameOptions = {
      key: 'X-Frame-Options',
      value: 'SAMEORIGIN',
    };

    return [
      {
        source: '/',
        headers: [xFrameOptions],
      },
      {
        source: '/signin',
        headers: [
          xFrameOptions,
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.CONSOLE_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
      {
        source: '/signup',
        headers: [xFrameOptions],
      },
      {
        source: '/workspaces(.*)',
        headers: [xFrameOptions],
      },
      {
        source: '/account(.*)',
        headers: [xFrameOptions],
      },
    ];
  },
};
