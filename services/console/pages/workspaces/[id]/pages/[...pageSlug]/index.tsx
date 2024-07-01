import { GetServerSideProps } from 'next';
import { serverSideTranslations } from '../../../../../utils/serverSideTranslations';

export { default } from '../../../../../views/Page';

export const getServerSideProps: GetServerSideProps = async ({
  locale = '',
}) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      'common',
      'workspaces',
      'errors',
      'user',
      'pages',
    ])),
  },
});
