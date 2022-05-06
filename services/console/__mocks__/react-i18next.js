const t = (str) => str;
export const useTranslation = () => {
  return {
    t,
    i18n: {
      language: 'en',
    },
  };
};

export const Trans = ({ children = null }) => {
  return children;
};
