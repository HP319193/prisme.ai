import { useTranslation } from 'next-i18next';
import getConfig from 'next/config';

const {
  publicRuntimeConfig: { PAGES_HOST = global.location.origin, ENDPOINT = '' },
} = getConfig();

export const generateEndpoint = (workspaceId: string, slug: string) =>
  ENDPOINT.replace(/\{\{workspaceId\}\}/, workspaceId).replace(
    /\{\{slug\}\}/,
    slug
  );

const urls = {
  generateEndpoint,
};
export default urls;

export const usePageEndpoint = () => {
  const {
    i18n: { language },
  } = useTranslation();

  return PAGES_HOST.replace(/\{\{lang\}\}/, language);
};
