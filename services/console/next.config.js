const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  i18n,
  publicRuntimeConfig: {
    API_HOST: process.env.NEXT_PUBLIC_API_HOST,
    ENDPOINT: `${process.env.NEXT_PUBLIC_API_HOST}/workspace/{{workspaceId}}/{{slug}}`,
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  },
};
