import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export { default } from '../../views/BlockPreview';

export const getServerSideProps = async ({ locale = '' }) => {
  return {
    props: {
      page: {},
      ...(await serverSideTranslations(locale, ['common', 'sign', 'pages'])),
    },
  };
};
