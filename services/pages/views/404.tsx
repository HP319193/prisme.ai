import Page from './Page';

export const NotFoundError = () => {
  return <Page page={null} error={404} />;
};

export default NotFoundError;
