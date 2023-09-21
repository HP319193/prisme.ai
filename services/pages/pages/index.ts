import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import api, { HTTPError } from '../../console/utils/api';
import { getSubmodain } from '../../console/utils/urls';
import { computePageStyles } from '../utils/computeBlocksStyles';
import { getBlocksConfigFromServer } from '../utils/getBlocksConfigFromServer';
import { PageProps } from '../views/Page';
import BUILTIN_PAGES from '../builtinPages';

export { default } from '../views/Page';

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  locale = '',
  query,
}) => {
  let page: PageProps['page'] = null;
  let error: number | null = null;
  let styles = '';
  let initialConfig: Record<string, any>[] = [];

  const workspaceSlug = getSubmodain(req.headers.host || '');
  try {
    api.token = req.cookies['access-token'] || null;
    page = await api.getPageBySlug(workspaceSlug, 'index');
    page = (await getBlocksConfigFromServer(
      page,
      { ...query, pageSlug: 'index' },
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
    if ([401, 403].includes(error)) {
      const builtinPage = BUILTIN_PAGES.find(({ slug }) => slug === '_401');
      if (builtinPage) {
        page = builtinPage;
      }
      try {
        page = await api.getPageBySlug(workspaceSlug, '_401');
      } catch {}
    }
    if (error === 404) {
      console.error('404', workspaceSlug, 'index');
      return {
        notFound: true,
      };
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
