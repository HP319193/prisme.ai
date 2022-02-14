import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export { default } from '../../../../../views/Automation';

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
