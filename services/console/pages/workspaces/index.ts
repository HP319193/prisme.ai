import { GetServerSideProps } from 'next';
import { serverSideTranslations } from '../../utils/serverSideTranslations';

export { default } from '../../views/Workspaces';

export const getServerSideProps: GetServerSideProps = async ({
  locale = '',
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'workspaces', 'user'])),
  },
});
