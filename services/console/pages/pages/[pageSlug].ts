import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import api, { HTTPError } from '../../utils/api';
import { getSubmodain } from '../../utils/urls';

import { PublicPageProps } from '../../views/PublicPage';
export { default } from '../../views/PublicPage';

export const getServerSideProps: GetServerSideProps<
  PublicPageProps,
  { pageSlug: string }
> = async ({ req, res, locale = '', params: { pageSlug } = {} }) => {
  let page: PublicPageProps['page'] = null;
  let error: number | null = null;
  try {
    if (!pageSlug) {
      throw new Error('nope');
    }
    const workspaceSlug = getSubmodain(req.headers.host || '');
    page = await api.getPageBySlug(workspaceSlug, pageSlug);
  } catch (e) {
    res.statusCode = error = (<HTTPError>e).code;
  }

  return {
    props: {
      page,
      error: error,
      ...(await serverSideTranslations(locale, ['common', 'sign', 'pages'])),
    },
  };
};
