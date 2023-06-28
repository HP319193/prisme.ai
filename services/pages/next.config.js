const { headers, ...config } = require('../console/next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...config,
  publicRuntimeConfig: {
    ...config.publicRuntimeConfig,
    OIDC_PAGES_CLIENT_ID_PREFIX:
      process.env.OIDC_PAGES_CLIENT_ID_PREFIX || 'workspace-client-',
  },
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
