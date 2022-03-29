import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import api from '../../utils/api';

import { PublicPageProps } from '../../views/PublicPage';
export { default } from '../../views/PublicPage';

export const getServerSideProps: GetServerSideProps<
  PublicPageProps,
  { pageSlug: string }
> = async ({ locale = '', params: { pageSlug } = {} }) => {
  let page: PublicPageProps['page'] = null;
  try {
    if (!pageSlug) {
      throw new Error('nope');
    }
    page = await api.getPageBySlug(pageSlug);
  } catch (e) {}

  return {
    props: {
      page,
      ...(await serverSideTranslations(locale, ['common', 'pages'])),
    },
  };
};
