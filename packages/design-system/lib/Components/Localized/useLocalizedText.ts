import { useCallback } from 'react';
import Prismeai from '@prisme.ai/sdk';
import { Schema } from '../SchemaForm';

const translatable = ['title', 'description', 'label'];
const isTranslatedElement = (key: string, value: any) => {
  if (translatable.includes(key)) {
    if (
      typeof value === 'string' ||
      Object.keys(value).every((key) => key.length === 2)
    ) {
      return true;
    }
  }
  return false;
};

export const useLocalizedText = (t: any, language: string) => {
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

  const localizeSchemaForm = useCallback<
    (schema: Schema | Prismeai.TypedArgument) => Schema
  >(
    (original: any) => {
      const localizeSchemaForm = (mayBeTranslatable: any) => {
        if (typeof mayBeTranslatable === 'object') {
          const isArray = Array.isArray(mayBeTranslatable);
          const newObject = isArray
            ? [...mayBeTranslatable]
            : { ...mayBeTranslatable };
          for (const key of Object.keys(newObject)) {
            const value = newObject[key];
            if (isTranslatedElement(key, value)) {
              newObject[key] = localize(value);
            } else {
              newObject[key] = localizeSchemaForm(value);
            }
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
