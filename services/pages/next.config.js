const { headers, ...config } = require('../console/next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...config,
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
