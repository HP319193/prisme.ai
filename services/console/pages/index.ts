import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from '../utils/serverSideTranslations';

export { default } from '../views/Home';

export const getServerSideProps: GetServerSideProps = async ({
  locale = '',
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
