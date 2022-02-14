import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

export const useLocalizedText = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const translate = useCallback(
    (text: Prismeai.LocalizedText | undefined) => {
      if (!text) return '';
      if (typeof text === 'string') return text;
      return text[language] || text.en;
    },
    [language]
  );

  return translate;
};

export default useLocalizedText;
