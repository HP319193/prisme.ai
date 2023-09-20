import { RichText } from '@prisme.ai/blocks/lib/Blocks';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import api, { HTTPError } from '../../console/utils/api';
import { getSubmodain } from '../../console/utils/urls';
import { computePageStyles } from '../utils/computeBlocksStyles';
import { getBlocksConfigFromServer } from '../utils/getBlocksConfigFromServer';
import { PageProps } from '../views/Page';
import BUILTIN_PAGES from '../builtinPages';

export { default } from '../views/Page';

export const getServerSideProps: GetServerSideProps<
  PageProps,
  { pageSlug: string[] }
> = async ({ req, res, locale = '', params: { pageSlug } = {}, query }) => {
  if (!pageSlug || req.url === '/favicon.ico')
    return {
      notFound: true,
    };

  if (pageSlug.join('/') === 'index') {
    return {
      redirect: {
        permanent: true,
        destination: '/',
      },
    };
  }

  let page: PageProps['page'] = null;
  let error: number | null = null;
  let initialConfig: Record<string, any>[] = [];
  let styles = '';

  const workspaceSlug = getSubmodain(req.headers.host || '');
  try {
    page = await api.getPageBySlug(workspaceSlug, pageSlug.join('/'));
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
    const { page: p, styles: s } = computePageStyles(page);
    page = p;
    styles = s;
  } catch (e) {
    res.statusCode = error = (e as HTTPError).code;
    const fallbackSlug = [401, 403].includes((e as HTTPError).code)
      ? '_401'
      : pageSlug.join('/');
    const builtinPage = BUILTIN_PAGES.find(({ slug }) => slug === fallbackSlug);
    if (builtinPage) {
      page = builtinPage;
    }
    if (page && page.slug === '_401') {
      try {
        page = await api.getPageBySlug(workspaceSlug, '_401');
      } catch {}
    }
    if (error === 404) {
      if (page) {
        // Page has been replaced by a builtin one, become a 200
        res.statusCode = error = 200;
      } else {
        console.error('404', workspaceSlug, pageSlug);
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
