import { GetServerSideProps } from 'next';
import { serverSideTranslations } from '../../utils/serverSideTranslations';

export { default } from '../../views/Account/ConfirmDelete';

export const getServerSideProps: GetServerSideProps = async ({
  locale = '',
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'sign'])),
  },
});
