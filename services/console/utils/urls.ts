import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

export const generateEndpoint = (workspaceId: string, slug: string) =>
  `${publicRuntimeConfig.ENDPOINT}`
    .replace(/\{\{workspaceId\}\}/, workspaceId)
    .replace(/\{\{slug\}\}/, slug);

const urls = {
  generateEndpoint,
};
export default urls;
