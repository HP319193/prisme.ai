import {
  Collapse,
  FieldProps,
  Loading,
  Schema,
  SchemaForm,
  Tabs,
  useSchemaForm,
} from '@prisme.ai/design-system';
import { TabsProps } from 'antd';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { useField } from 'react-final-form';
import useLocalizedText from '../../utils/useLocalizedText';
import CSSEditor from '../../views/Page/CSSEditor';
import ConfirmButton from '../ConfirmButton';
import { useBlocksListEditor } from './BlocksListEditorProvider';
import componentsWithBlocksList from './componentsWithBlocksList';

interface SchemaFormProps {
  name: string;
  onRemove: () => void;
}

const getCSSEditorField = (styles: string) =>
  function CSSEditorField(props: FieldProps) {
    return (
      <div className="m-4">
        <CSSEditor
          {...props}
          label="pages.blocks.settings.css.label"
          description="pages.blocks.settings.css.description"
          reset="pages.blocks.settings.css.reset"
          defaultStyles={styles}
          opened
        />
      </div>
    );
  };

const defaultStyles = `:block {
  
}`;

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
          updateOn: {
            type: 'string',
            title: 'pages.blocks.settings.updateOn.label',
            description: 'pages.blocks.settings.updateOn.description',
          },
        },
      }),
    [localizeSchemaForm]
  );

  const styleSchema: Schema = useMemo(
    () =>
      localizeSchemaForm({
        type: 'object',
        properties: {
          sectionId: {
            type: 'string',
            title: 'pages.blocks.settings.sectionId.label',
            description: 'pages.blocks.settings.sectionId.description',
          },
          className: {
            type: 'string',
            title: 'pages.blocks.settings.className.label',
            description: 'pages.blocks.settings.className.description',
          },
          css: {
            type: 'string',
            'ui:widget': getCSSEditorField(defaultStyles),
            defaut: defaultStyles,
          },
        },
      }),
    [localizeSchemaForm]
  );

  const logicalSchema: Schema = useMemo(
    () =>
      localizeSchemaForm({
        type: 'object',
        properties: {
          template_if: {
            type: 'string',
            title: 'pages.blocks.settings.logical.if.label',
            description: 'pages.blocks.settings.logical.if.description',
          },
          template_repeat: {
            type: 'object',
            title: 'pages.blocks.settings.logical.repeat.label',
            description: 'pages.blocks.settings.logical.repeat.description',
            properties: {
              on: {
                type: 'string',
                title: 'pages.blocks.settings.logical.repeat.on.label',
                description:
                  'pages.blocks.settings.logical.repeat.on.description',
              },
              as: {
                type: 'string',
                title: 'pages.blocks.settings.logical.repeat.as.label',
                description:
                  'pages.blocks.settings.logical.repeat.as.description',
              },
            },
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
              <div className="ml-4 flex-1 text-gray">
                {field.input.value.sectionId
                  ? `#${field.input.value.sectionId}`
                  : ''}
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
                    {
                      key: 'logical',
                      label: t('blocks.builder.logical.label'),
                      children: (
                        <SchemaForm
                          schema={logicalSchema}
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
                    {
                      key: 'style',
                      label: t('blocks.builder.style.label'),
                      children: (
                        <SchemaForm
                          schema={styleSchema}
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
