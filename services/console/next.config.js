const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  i18n,
  publicRuntimeConfig: {
    API_HOST: process.env.API_HOST,
    ENDPOINT: `${process.env.ENDPOINT}/workspace/{{workspaceId}}/{{slug}}`,
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  },
};
