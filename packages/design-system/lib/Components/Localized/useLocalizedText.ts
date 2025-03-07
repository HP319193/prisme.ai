import { useCallback } from 'react';
import '@prisme.ai/types';
import { Schema } from '../SchemaForm';

export const isLocalizedObject = (
  value: any
): value is Prismeai.LocalizedText => {
  return (
    typeof value === 'string' ||
    (value &&
      typeof value === 'object' &&
      Object.keys(value).every((key) => key.length === 2))
  );
};
const translatable = [
  'title',
  'description',
  'label',
  'add',
  'remove',
  'placeholder',
];
const isTranslatedElement = (key: string, value: any) => {
  if (translatable.includes(key)) {
    return isLocalizedObject(value);
  }
  return false;
};

export const useLocalizedText = (t: any, language: string) => {
  const localize = useCallback(
    (text: Prismeai.LocalizedText | undefined) => {
      if (!text) return '';
      if (typeof text === 'string' || typeof text === 'number') return t(text);
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
          if (
            isArray &&
            mayBeTranslatable.every((key) => isLocalizedObject(key))
          ) {
            return mayBeTranslatable.map((key) => localize(key));
          }
          const newObject = isArray
            ? [...mayBeTranslatable]
            : { ...mayBeTranslatable };
          for (const key of Object.keys(newObject)) {
            const value = newObject[key];
            if (isTranslatedElement(key, value)) {
              newObject[key] = value && localize(value);
            } else {
              newObject[key] = value && localizeSchemaForm(value);
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
