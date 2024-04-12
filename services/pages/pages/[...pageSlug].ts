import { getPageServerSideProps } from '../utils/getPageServerSideProps';

export { default } from '../views/Page';

export const getServerSideProps = getPageServerSideProps(
  ({ pageSlug } = {}) =>
    (pageSlug && (Array.isArray(pageSlug) ? pageSlug.join('/') : pageSlug)) ||
    ''
);
