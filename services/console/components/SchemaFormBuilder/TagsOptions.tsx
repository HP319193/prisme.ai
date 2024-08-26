import { SchemaForm, UiOptionsTags } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';

interface TagsOptionsProps {
  value: Partial<UiOptionsTags>;
  onChange: (v: UiOptionsTags) => void;
}

export const TagsOptions = ({ value, onChange }: TagsOptionsProps) => {
  const { t } = useTranslation('common');

  return (
    <SchemaForm
      schema={{
        type: 'object',
        properties: {
          tags: {
            type: 'object',
            title: t('schemaForm.builder.uiOptions.tags.title'),
            properties: {
              allowNew: {
                type: 'boolean',
                title: t('schemaForm.builder.uiOptions.tags.allowNew.title'),
                description: t(
                  'schemaForm.builder.uiOptions.tags.allowNew.description'
                ),
              },
              options: {
                type: 'array',
                title: t('schemaForm.builder.uiOptions.tags.options.title'),
                items: {
                  type: 'object',
                  properties: {
                    value: {
                      title: t('schemaForm.builder.uiOptions.tags.value.title'),
                      type: 'string',
                    },
                    label: {
                      title: t('schemaForm.builder.uiOptions.tags.label.title'),
                      type: 'string',
                    },
                    color: {
                      title: t('schemaForm.builder.uiOptions.tags.color.title'),
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
