import { Schema, UiOptionsOneOf } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

export const useLocalizedText = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('workspaces');

  const localize = useCallback(
    (text: Prismeai.LocalizedText | undefined) => {
      if (!text) return '';
      if (typeof text === 'string') return t(text);
      if (text[language]) return text[language];
      if (text.en) return text.en;
      return text[Object.keys(text)[0]];
    },
    [language, t]
  );

  const localizeSchemaForm = useCallback(
    (original: any) => {
      const translatable = ['title', 'description', 'label'];
      const localizeSchemaForm = (mayBeTranslatable: any) => {
        if (typeof mayBeTranslatable === 'object') {
          const isArray = Array.isArray(mayBeTranslatable);
          const newObject = isArray
            ? [...mayBeTranslatable]
            : { ...mayBeTranslatable };
          for (const key of Object.keys(newObject)) {
            const value = newObject[key];
            newObject[key] =
              (translatable.includes(key) || isArray) &&
              typeof value === 'string'
                ? localize(value)
                : localizeSchemaForm(value);
          }
          return newObject;
        }
        return mayBeTranslatable;
      };

      return localizeSchemaForm(original);
    },
    [localize]
  );

  return { localize, localizeSchemaForm };
};

export default useLocalizedText;
