import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

const endpoint =
  `${publicRuntimeConfig.API_HOST}/${publicRuntimeConfig.ENDPOINT}` || "";

console.log("point", publicRuntimeConfig);

export const generateEndpoint = (workspaceId: string, slug: string) =>
  endpoint
    .replace(/\{\{workspaceId\}\}/, workspaceId)
    .replace(/\{\{slug\}\}/, slug);

const urls = {
  generateEndpoint,
};
export default urls;
