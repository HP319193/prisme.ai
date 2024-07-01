import { GetServerSideProps } from 'next';
import { serverSideTranslations } from '../../../utils/serverSideTranslations';

export { default } from '../../../views/Workspace';

export const getServerSideProps: GetServerSideProps = async ({
  locale = '',
}) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      'common',
      'workspaces',
      'errors',
      'user',
    ])),
  },
});
