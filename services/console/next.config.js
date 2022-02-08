const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  i18n,
  publicRuntimeConfig: {
    API_HOST: process.env.API_HOST,
    ENDPOINT: `${process.env.API_HOST}/workspaces/{{workspaceId}}/webhooks/{{slug}}`,
    SENTRY_DSN: process.env.SENTRY_DSN || '',
  },
};
