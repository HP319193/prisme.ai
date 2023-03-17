import { useTranslation } from 'next-i18next';
import getConfig from 'next/config';
import { useWorkspace } from '../providers/Workspace';

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

  return `${window.location.protocol}//${slug}${PAGES_HOST}/${language}`;
};

export function getSubmodain(host: string) {
  return host.split(PAGES_HOST)[0];
}

export function generatePageUrl(workspaceSlug: string, pageSlug: string) {
  return `${window.location.protocol}//${workspaceSlug}${PAGES_HOST}/${
    pageSlug === 'index' ? '' : pageSlug
  }`;
}

export class ReplaceStateEvent extends Event {
  public prevLocation = '';
  public nextLocation = '';
}

export function replaceSilently(newPath: string) {
  const [, lang, ...url] = window.location.pathname.split('/') || [];
  const e = new ReplaceStateEvent('replaceState');
  e.prevLocation = `/${url.join('/')}`;
  e.nextLocation = newPath;
  window.history.replaceState(
    {},
    '',
    `/${lang}${newPath}`.replace(/\/\//, '/')
  );

  window?.dispatchEvent(e);
}
