const { headers, ...config } = require('../console/next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...config,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
