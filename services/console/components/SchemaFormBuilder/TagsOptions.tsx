import { SchemaForm, UiOptionsTags } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';

interface TagsOptionsProps {
  value: Partial<UiOptionsTags>;
  onChange: (v: UiOptionsTags) => void;
}

export const TagsOptions = ({ value, onChange }: TagsOptionsProps) => {
  const { t } = useTranslation('workspaces');

  return (
    <SchemaForm
      schema={{
        type: 'object',
        properties: {
          tags: {
            type: 'object',
            title: t('schema.uiOptions.tags.title'),
            properties: {
              allowNew: {
                type: 'boolean',
                title: t('schema.uiOptions.tags.allowNew.title'),
                description: t('schema.uiOptions.tags.allowNew.description'),
              },
              options: {
                type: 'array',
                title: t('schema.uiOptions.tags.options.title'),
                items: {
                  type: 'object',
                  properties: {
                    value: {
                      title: t('schema.uiOptions.tags.value.title'),
                      type: 'string',
                    },
                    label: {
                      title: t('schema.uiOptions.tags.label.title'),
                      type: 'string',
                    },
                    color: {
                      title: t('schema.uiOptions.tags.color.title'),
                      type: 'string',
                      'ui:widget': 'color',
                    },
                  },
                },
              },
            },
          },
        },
      }}
      buttons={[]}
      initialValues={value}
      onChange={onChange}
    />
  );
};

export default TagsOptions;
