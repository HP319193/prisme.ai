import { GetServerSideProps } from 'next';
import { serverSideTranslations } from '../../../../../utils/serverSideTranslations';

export { default } from '../../../../../views/AppInstance/AppInstance';

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
