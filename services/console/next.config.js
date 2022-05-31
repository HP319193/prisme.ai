const { i18n } = require('./next-i18next.config');

// Use the first withTM if you want to not use /dist of @prisme.ai projects.
// Use the second one for the regular /dist usage.
const withTM = require('next-transpile-modules')(['@prisme.ai/blocks']);
// const withTM = (config) => config;

/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: true,
  i18n,
  publicRuntimeConfig: {
    API_HOST: process.env.API_HOST,
    ENDPOINT: `${process.env.API_HOST}/workspaces/{{workspaceId}}/webhooks/{{slug}}`,
    PAGES_HOST: process.env.PAGES_HOST,
    SENTRY_DSN: process.env.SENTRY_DSN || '',
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svgr$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
});
