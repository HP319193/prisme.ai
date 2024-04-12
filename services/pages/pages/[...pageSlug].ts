import { getPageServerSideProps } from '../utils/getPageServerSideProps';

export { default } from '../views/Page';

export const getServerSideProps = getPageServerSideProps(
  ({ pageSlug } = {}) => {
    const slug =
      (pageSlug && (Array.isArray(pageSlug) ? pageSlug.join('/') : pageSlug)) ||
      '';
    if (slug === 'index') return null;
    return slug;
  }
);
