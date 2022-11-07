import { useTranslation } from 'next-i18next';
import getConfig from 'next/config';
import { useWorkspace } from '../components/WorkspaceProvider';

const {
  publicRuntimeConfig: {
    PAGES_HOST = `${global?.location?.origin}/pages`,
    API_HOST = '',
  },
} = getConfig();

export const generateEndpoint = (workspaceId: string, slug: string) =>
  `${API_HOST}/workspaces/${workspaceId}/webhooks/${slug}`;

const urls = {
  generateEndpoint,
};
export default urls;

export const usePageEndpoint = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const {
    workspace: { slug },
  } = useWorkspace();

  if (!slug) return '';

  return `https://${slug}${PAGES_HOST}/${language}`;
};

export function getSubmodain(host: string) {
  return host.split(PAGES_HOST)[0];
}
