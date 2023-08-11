import {
  Collapse,
  Input,
  Loading,
  Schema,
  SchemaForm,
  Tabs,
  Tooltip,
  useSchemaForm,
} from '@prisme.ai/design-system';
import { TabsProps } from 'antd';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { useField } from 'react-final-form';
import useLocalizedText from '../../utils/useLocalizedText';
import ConfirmButton from '../ConfirmButton';
import { useBlocksListEditor } from './BlocksListEditorProvider';
import componentsWithBlocksList from './componentsWithBlocksList';

interface SchemaFormProps {
  name: string;
  onRemove: () => void;
}

export const BlockForm = ({ name, onRemove }: SchemaFormProps) => {
  const { t } = useTranslation('workspaces');
  const { localizeSchemaForm } = useLocalizedText();
  const { getSchema } = useBlocksListEditor();
  const [schema, setSchema] = useState<Schema | 'loading' | null>(null);
  const field = useField(name);
  const { utils, locales } = useSchemaForm();

  useEffect(() => {
    const loadSchema = async () => {
      setSchema('loading');
      const schema = await getSchema(field.input.value.slug);
      // Remove classname because its moved to collapse title position
      delete schema?.properties?.className;
      setSchema(schema || null);
    };
    loadSchema();
  }, [field.input.value.slug, getSchema]);

  const lifecycleSchema: Schema = useMemo(
    () =>
      localizeSchemaForm({
        type: 'object',
        properties: {
          onInit: {
            type: 'string',
            title: 'pages.blocks.settings.onInit.label',
            description: 'pages.blocks.settings.onInit.description',
          },
          updateOn: {
            type: 'string',
            title: 'pages.blocks.settings.updateOn.label',
            description: 'pages.blocks.settings.updateOn.description',
          },
          automation: {
            type: 'string',
            title: 'pages.blocks.settings.automation.label',
            description: 'pages.blocks.settings.automation.description',
            'ui:widget': 'select',
            'ui:options': {
              from: 'automations',
              filter: 'endpoint',
            },
          },
          sectionId: {
            type: 'string',
            title: 'pages.blocks.settings.sectionId.label',
            description: 'pages.blocks.settings.sectionId.description',
          },
        },
      }),
    [localizeSchemaForm]
  );

  return (
    <Collapse
      items={[
        {
          label: (
            <div className="flex flex-row items-center">
              <div>{field.input.value.slug}</div>
              <div className="ml-4 flex-1" onClick={(e) => e.stopPropagation()}>
                <Tooltip title={t('blocks.builder.className.help')}>
                  <Input
                    value={field.input.value.className}
                    onChange={({ target: { value } }) =>
                      field.input.onChange({
                        ...field.input.value,
                        className: value,
                      })
                    }
                    placeholder={t('blocks.builder.className.placeholder')}
                  />
                </Tooltip>
              </div>
            </div>
          ),
          content: (
            <div className="m-8">
              <Tabs
                items={
                  [
                    schema && {
                      key: 'config',
                      label: t('blocks.builder.setup.label'),
                      children: (
                        <>
                          {schema === 'loading' && <Loading />}
                          {schema !== 'loading' && (
                            <SchemaForm
                              schema={schema}
                              locales={locales}
                              buttons={[]}
                              initialValues={field.input.value}
                              utils={utils}
                              components={componentsWithBlocksList}
                              onChange={(v) => {
                                field.input.onChange({
                                  ...field.input.value,
                                  ...v,
                                  slug: field.input.value.slug,
                                });
                              }}
                            />
                          )}
                        </>
                      ),
                    },
                    {
                      key: 'lifecycle',
                      label: t('blocks.builder.lifecycle.label'),
                      children: (
                        <SchemaForm
                          schema={lifecycleSchema}
                          locales={locales}
                          buttons={[]}
                          initialValues={field.input.value}
                          utils={utils}
                          components={componentsWithBlocksList}
                          onChange={(v) => {
                            field.input.onChange({
                              ...field.input.value,
                              ...v,
                              slug: field.input.value.slug,
                            });
                          }}
                        />
                      ),
                    },
                  ].filter(Boolean) as TabsProps['items']
                }
                tabBarExtraContent={
                  <ConfirmButton
                    onConfirm={onRemove}
                    confirmLabel={t('blocks.builder.delete.confirm')}
                  >
                    {t('blocks.builder.delete.label')}
                  </ConfirmButton>
                }
              />
            </div>
          ),
        },
      ]}
    />
  );
};

export default BlockForm;
