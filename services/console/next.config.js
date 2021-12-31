const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  i18n,
  publicRuntimeConfig: {
    // API_HOST: process.env.API_HOST,
    // Restore the above line to plug the front to the real
    // back-end
    API_HOST: "https://api.eda.prisme.ai/v2",
    ENDPOINT: process.env.ENDPOINT || "workspace/{{workspaceId}}/{{slug}}",
  },
};
