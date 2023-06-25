const { i18n } = require('./next-i18next.config');

function getTracking() {
  try {
    return JSON.parse(process.env.TRACKING) || {};
  } catch {
    return {};
  }
}

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  i18n,
  publicRuntimeConfig: {
    API_HOST: process.env.API_HOST,
    CONSOLE_HOST: process.env.CONSOLE_HOST || '',
    PAGES_HOST: process.env.PAGES_HOST || '',
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    HEADER_POPOVERS: process.env.HEADER_POPOVERS || '{}',
    SUGGESTIONS_ENDPOINT: process.env.SUGGESTIONS_ENDPOINT || '',
    BILLING_HOME: process.env.BILLING_HOME || '',
    BILLING_USAGE: process.env.BILLING_USAGE || '',
    TRACKING: getTracking(),
    OIDC_PROVIDER_URL:
      process.env.OIDC_PROVIDER_URL ||
      (process.env.API_URL && process.env.API_URL.replace('/v2', '')) ||
      'http://studio.local.prisme.ai:3001',
    OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID || 'local-client-id',
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
            value: process.env.CONSOLE_HOST || '*',
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
