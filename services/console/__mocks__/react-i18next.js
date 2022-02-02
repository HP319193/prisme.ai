export const useTranslation = () => {
  return {
    t: (str) => str,
  };
};

export const Trans = ({ children }) => {
  return children;
};
