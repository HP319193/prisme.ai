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
    (original: Schema) => {
      const schema = { ...original };
      const { properties, items, enumNames, oneOf } = schema;

      if (schema.title) {
        schema.title = localize(schema.title);
      }
      if (schema.description) {
        schema.description = localize(schema.description);
      }

      if (enumNames) {
        schema.enumNames = enumNames.map((enumName) => localize(enumName));
      }

      if (oneOf) {
        schema.oneOf = oneOf.map((one) => localizeSchemaForm(one));
      }

      if (properties) {
        Object.keys(properties).forEach((key) => {
          properties[key] = localizeSchemaForm(properties[key]);
        });
      }
      if (items) {
        schema.items = localizeSchemaForm(items);
      }

      return schema;
    },
    [localize]
  );

  return { localize, localizeSchemaForm };
};

export default useLocalizedText;
