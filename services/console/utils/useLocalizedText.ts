import { Schema } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

export const useLocalizedText = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const localize = useCallback(
    (text: Prismeai.LocalizedText | undefined) => {
      if (!text) return '';
      if (typeof text === 'string') return text;
      if (text[language]) return text[language];
      if (text.en) return text.en;
      return text[Object.keys(text)[0]];
    },
    [language]
  );

  const localizeSchemaForm = useCallback(
    (schema: Schema) => {
      console.log(schema);
      return schema;
    },
    [language]
  );

  return { localize, localizeSchemaForm };
};

export default useLocalizedText;
