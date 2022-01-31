const { i18n } = require('./next-i18next.config');
const withLess = require('next-with-less');

/** @type {import('next').NextConfig} */
module.exports = withLess({
  reactStrictMode: true,
  i18n,
  publicRuntimeConfig: {
    API_HOST: process.env.API_HOST,
    ENDPOINT: `${process.env.API_HOST}/workspaces/{{workspaceId}}/webhooks/{{slug}}`,
    SENTRY_DSN: process.env.SENTRY_DSN || '',
  },
});
