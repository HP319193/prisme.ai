const { i18n } = require('./next-i18next.config');

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
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svgr$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
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
        headers: [xFrameOptions],
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
