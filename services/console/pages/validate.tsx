import { GetServerSideProps } from 'next';
import { serverSideTranslations } from '../utils/serverSideTranslations';

export { default } from '../views/Sign/Validate';

export const getServerSideProps: GetServerSideProps = async ({
  locale = '',
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'sign'])),
  },
});
