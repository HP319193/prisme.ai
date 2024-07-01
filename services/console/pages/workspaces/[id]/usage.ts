import { GetServerSideProps } from 'next';
import { serverSideTranslations } from '../../../utils/serverSideTranslations';

export { default } from '../../../views/Usage/Usage';

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
