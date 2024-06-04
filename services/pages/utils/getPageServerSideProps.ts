import { GetServerSideProps } from 'next';
import api, { HTTPError } from '../../console/utils/api';
import { getSubmodain } from '../../console/utils/urls';
import { PageProps } from '../views/Page';
import { computePageStyles } from './computeBlocksStyles';
import { getBlocksConfigFromServer } from './getBlocksConfigFromServer';
import { redirect } from './redirect';
import BUILTIN_PAGES from '../builtinPages';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';
import getConfig from 'next/config';

const cache = new Map();
async function getPage(host: string, pageSlug: string) {
  const workspaceSlug = getSubmodain(host || '');
  const key = `${workspaceSlug}-${pageSlug}`;
  if (!cache.has(key)) {
    const page = await api.getPageBySlug(workspaceSlug, pageSlug);
    if (page.public) {
      cache.set(key, page);
      setTimeout(() => cache.delete(key), 1000 * 60);
    }
    return page;
  }
  return cache.get(key) || null;
}

const {
  publicRuntimeConfig: { DISABLE_SSR = false },
} = getConfig();

export const getPageServerSideProps =
  (
    getSlug: (params: NextParsedUrlQuery | undefined) => string | null
  ): GetServerSideProps<PageProps> =>
  async ({ req, res, locale = '', query, params }) => {
    if (DISABLE_SSR)
      return {
        props: {
          page: null,
          ...(await serverSideTranslations(locale, [
            'common',
            'sign',
            'pages',
          ])),
        },
      };
    const pageSlug = getSlug(params);
    if (pageSlug === null) {
      return {
        redirect: {
          permanent: true,
          destination: '/',
        },
      };
    }
    if (!pageSlug || req.url === '/favicon.ico')
      return {
        notFound: true,
      };

    let error: number | null = null;
    let initialConfig: Record<string, any>[] = [];
    let styles = '';
    let page: Prismeai.DetailedPage | null = null;
    try {
      api.token = req.cookies['access-token'] || null;
      page = await getPage(req.headers.host || '', pageSlug);
      if (!page) {
        throw new HTTPError('not found', 404);
      }
      page = (await getBlocksConfigFromServer(
        page,
        {
          ...query,
          pageSlug: Array.isArray(query.pageSlug)
            ? query.pageSlug.join('')
            : query.pageSlug,
        },
        locale
      )) as Prismeai.DetailedPage;

      if (!page) {
        throw new Error('404');
      }

      const redirected = redirect(page);
      if (redirected) return redirected;

      const { page: p, styles: s } = computePageStyles(page);
      page = p;
      styles = s;
    } catch (e) {
      res.statusCode = error = (e as HTTPError).code;
      const fallbackSlug = [401, 403].includes((e as HTTPError).code)
        ? '_401'
        : pageSlug;
      const builtinPage = BUILTIN_PAGES.find(
        ({ slug }) => slug === fallbackSlug
      );
      if (builtinPage) {
        page = builtinPage;
      }
      if (page && page.slug === '_401') {
        try {
          page = await getPage(req.headers.host || '', '_401');
        } catch {}
      }
      if (error === 404) {
        if (page) {
          // Page has been replaced by a builtin one, become a 200
          res.statusCode = error = 200;
        } else {
          console.error('404', req.headers.host, pageSlug);
          return {
            notFound: true,
          };
        }
      }
    }
    return {
      props: {
        page,
        clientId: api.overwriteClientId || null,
        error: error || null,
        initialConfig,
        styles,
        ...(await serverSideTranslations(locale, ['common', 'sign', 'pages'])),
      },
    };
  };
