import { getPageServerSideProps } from '../utils/getPageServerSideProps';

export { default } from '../views/Page';

export const getServerSideProps = getPageServerSideProps(() => 'index');
