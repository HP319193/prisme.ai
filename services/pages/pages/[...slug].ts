import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import api, { HTTPError } from '../../console/utils/api';
import { getSubmodain } from '../../console/utils/urls';
import { getBlocksConfigFromServer } from '../utils/getBlocksConfigFromServer';
import { PageProps } from '../views/Page';

export { default } from '../views/Page';

export const getServerSideProps: GetServerSideProps<
  PageProps,
  { slug: string[] }
> = async ({ req, res, locale = '', params: { slug } = {} }) => {
  if (!slug || req.url === '/favicon.ico')
    return {
      notFound: true,
    };

  let page: PageProps['page'] = null;
  let error: number | null = null;
  let initialConfig: Record<string, any>[] = [];

  const workspaceSlug = getSubmodain(req.headers.host || '');
  try {
    page = await api.getPageBySlug(workspaceSlug, slug.join('/'));
    initialConfig = await getBlocksConfigFromServer(page);
  } catch (e) {
    res.statusCode = error = (e as HTTPError).code;
    if (error === 404) {
      console.error('404', workspaceSlug, slug);
      return {
        notFound: true,
      };
    }
  }

  return {
    props: {
      page,
      error: error || null,
      initialConfig,
      ...(await serverSideTranslations(locale, ['common', 'sign', 'pages'])),
    },
  };
};
