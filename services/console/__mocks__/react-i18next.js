export const useTranslation = () => {
  return {
    t: (str) => str,
    i18n: {
      language: 'en',
    },
  };
};

export const Trans = ({ children = null }) => {
  return children;
};
