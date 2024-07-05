import { GetServerSideProps } from 'next';
import { serverSideTranslations } from '../../utils/serverSideTranslations';

export { default } from '../../views/Account/Account';

export const getServerSideProps: GetServerSideProps = async ({
  locale = '',
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'user', 'errors'])),
  },
});
