import { BlockComponent } from '@prisme.ai/blocks';
import {
  Collapse,
  FieldProps,
  Loading,
  Schema,
  schemaFormUtils,
  Tabs,
} from '@prisme.ai/design-system';
import { CollapseProps } from '@prisme.ai/design-system/lib/Components/Collapse';
import { TabsProps } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useField } from 'react-final-form';
import useLocalizedText from '../../utils/useLocalizedText';
import CSSEditor from '../../views/Page/CSSEditor';
import ConfirmButton from '../ConfirmButton';
import SchemaForm from '../SchemaForm/SchemaForm';
import { useBlocksListEditor } from './BlocksListEditorProvider';

interface SchemaFormProps extends Partial<CollapseProps> {
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

export const BlockForm = ({ name, onRemove, ...props }: SchemaFormProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('workspaces');
  const { localizeSchemaForm } = useLocalizedText();
  const { getSchema, getModule } = useBlocksListEditor();
  const [schema, setSchema] = useState<Schema | 'loading' | null>(null);
  const [Preview, setPreview] = useState<BlockComponent['Preview'] | null>(
    null
  );
  const field = useField(name);

  useEffect(() => {
    const loadSchema = async () => {
      setSchema('loading');
      const schema = await getSchema(field.input.value.slug);
      setSchema(schema || null);
    };
    loadSchema();
  }, [field.input.value.slug, getSchema]);

  useEffect(() => {
    async function loadPreview() {
      const module = await getModule(field.input.value.slug);
      setPreview(() => module?.Preview || null);
    }
    loadPreview();
  }, [field.input.value.slug, getModule]);

  const lifecycleSchema: Schema = useMemo(
    () =>
      localizeSchemaForm({
        type: 'object',
        properties: {
          onInit: {
            type: 'string',
            title: 'pages.blocks.settings.onInit.label',
            description: 'pages.blocks.settings.onInit.description',
            'ui:widget': 'autocomplete',
            'ui:options': {
              autocomplete: 'events:listen',
            },
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
            'ui:widget': 'autocomplete',
            'ui:options': {
              autocomplete: 'events:emit',
            },
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
  const throttled = useRef<NodeJS.Timeout>();
  const onChange = useCallback(
    (schema: Schema) => (value: any) => {
      if (throttled.current) {
        clearTimeout(throttled.current);
      }
      throttled.current = setTimeout(() => {
        let values: any = {};
        if (schema.properties) {
          const properties = schemaFormUtils.getProperties(schema, value);
          values = properties.reduce((prev, k) => {
            return {
              ...prev,
              [k]: value[k],
            };
          }, {});

          if (schema.additionalProperties) {
            const additionnalProperties = Object.keys(value).filter(
              (k) => !properties.includes(k)
            );
            additionnalProperties.forEach((k) => {
              values[k] = value[k];
            });
          }
        } else {
          values = value;
        }
        field.input.onChange({
          ...field.input.value,
          ...values,
          slug: field.input.value.slug,
        });
      }, 200);
    },
    [field.input]
  );

  const { slug, ...previewConfig } = field.input.value;

  return (
    <Collapse
      {...props}
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
                    Preview && {
                      key: 'preview',
                      label: t('blocks.builder.preview.label'),
                      children: (
                        <Preview config={previewConfig} language={language} />
                      ),
                    },
                    schema && {
                      key: 'config',
                      label: t('blocks.builder.setup.label'),
                      children: (
                        <>
                          {schema === 'loading' && <Loading />}
                          {schema !== 'loading' && (
                            <SchemaForm
                              schema={localizeSchemaForm(schema)}
                              buttons={[]}
                              initialValues={field.input.value}
                              onChange={onChange(schema)}
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
                          buttons={[]}
                          initialValues={field.input.value}
                          onChange={onChange(lifecycleSchema)}
                        />
                      ),
                    },
                    {
                      key: 'logical',
                      label: t('blocks.builder.logical.label'),
                      children: (
                        <SchemaForm
                          schema={logicalSchema}
                          buttons={[]}
                          initialValues={field.input.value}
                          onChange={onChange(logicalSchema)}
                        />
                      ),
                    },
                    {
                      key: 'style',
                      label: t('blocks.builder.style.label'),
                      children: (
                        <SchemaForm
                          schema={styleSchema}
                          buttons={[]}
                          initialValues={field.input.value}
                          onChange={onChange(styleSchema)}
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
