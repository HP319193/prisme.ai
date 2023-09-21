import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export { default } from '../views/Signup';

export const getServerSideProps: GetServerSideProps = async ({
  locale = '',
}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'sign', 'pages'])),
    },
  };
};
