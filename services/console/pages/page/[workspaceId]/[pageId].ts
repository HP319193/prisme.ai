import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import api from '../../../utils/api';

import { PublicPageProps } from '../../../views/PublicPage';
export { default } from '../../../views/PublicPage';

export const getServerSideProps: GetServerSideProps<
  PublicPageProps,
  { workspaceId: string; pageId: string }
> = async ({ locale = '', params: { workspaceId, pageId } = {} }) => {
  let page: PublicPageProps['page'] = null;
  try {
    if (!workspaceId || !pageId) {
      throw new Error('nope');
    }
    page = await api.getPage(workspaceId, pageId);
  } catch (e) {}

  return {
    props: {
      page,
      ...(await serverSideTranslations(locale, ['common', 'pages'])),
    },
  };
};
