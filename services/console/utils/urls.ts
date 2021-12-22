const NEXT_PUBLIC_ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT || "";

export const generateEndpoint = (workspaceId: string, slug: string) =>
  NEXT_PUBLIC_ENDPOINT.replace(/\{\{workspaceId\}\}/, workspaceId).replace(
    /\{\{slug\}\}/,
    slug
  );

const urls = {
  generateEndpoint,
};
export default urls;
