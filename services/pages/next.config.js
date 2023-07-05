const { headers, ...config } = require('../console/next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...config,
  publicRuntimeConfig: {
    ...config.publicRuntimeConfig,
  },
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
