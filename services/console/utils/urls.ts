export const generateEndpoint = (workspaceId: string, slug: string) =>
  `${process.env.ENDPOINT}`
    .replace(/\{\{workspaceId\}\}/, workspaceId)
    .replace(/\{\{slug\}\}/, slug);

const urls = {
  generateEndpoint,
};
export default urls;
