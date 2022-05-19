import {
  Button,
  Schema,
  SchemaForm,
  Tooltip,
  useBlock,
} from '@prisme.ai/design-system';
import { FieldProps } from '@prisme.ai/design-system/lib/Components/SchemaForm/types';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import { useField } from 'react-final-form';
import useLocalizedText from '../../utils/useLocalizedText';
import BlockTitle from './Components/BlockTitle';
import { InfoCircleOutlined } from '@ant-design/icons';
import Properties from '../SchemaFormBuilder/Properties';

const defaultSchema = {
  type: 'string',
  title: 'preview',
};

export const SchemaEditor = ({ name }: FieldProps) => {
  const field = useField(name);
  const { t } = useTranslation('workspaces');

  return (
    <div className="flex flex-1 mt-4">
      <div className="ant-input ">
        <div className="text-gray pl-4 flex flex-1 flex-row justify-between">
          {t('pages.blocks.form.schema.label')}
          <div className="text-accent mr-2">
            <Tooltip
              title={t('pages.blocks.form.schema.description')}
              placement="left"
            >
              <InfoCircleOutlined />
            </Tooltip>
          </div>
        </div>
        <Properties
          value={field.input.value.properties}
          onChange={(v: Record<string, Schema>) =>
            field.input.onChange({
              type: 'object',
              properties: v,
            })
          }
          addLabel={t('pages.blocks.form.schema.add')}
        />
      </div>
    </div>
  );
};

const schema: Schema = {
  type: 'object',
  properties: {
    title: {
      type: 'localized:string',
      title: 'pages.blocks.settings.blockTitle.label',
      description: 'pages.blocks.settings.blockTitle.description',
    },
    schema: {
      type: 'object',
      'ui:widget': SchemaEditor,
    },
    submitLabel: {
      type: 'localized:string',
      title: 'pages.blocks.form.submitLabel.label',
    },
    onSubmit: {
      type: 'string',
      title: 'pages.blocks.form.onSubmit.label',
      description: 'pages.blocks.form.onSubmit.description',
    },
    onChange: {
      type: 'string',
      title: 'pages.blocks.form.onChange.label',
      description: 'pages.blocks.form.onChange.description',
    },
  },
};

export const Form = ({}) => {
  const { config = {}, events } = useBlock();
  const { localizeSchemaForm, localize } = useLocalizedText();
  const { t } = useTranslation('pages');

  const onChange = useCallback(
    (values: any) => {
      if (!config.onChange || !events) return;
      events.emit(config.onChange, values);
    },
    [config.onChange, events]
  );

  const onSubmit = useCallback(
    (values: any) => {
      if (!config.onSubmit || !events) return;
      events.emit(config.onSubmit, values);
    },
    [config.onSubmit, events]
  );

  const localizedSchema = useMemo(() => {
    return localizeSchemaForm(config.schema || defaultSchema);
  }, [config.schema, localizeSchemaForm]);

  return (
    <div className="p-8">
      {config.title && <BlockTitle value={config.title} />}
      <SchemaForm
        schema={localizedSchema}
        onChange={onChange}
        onSubmit={onSubmit}
        buttons={[
          <div key={0} className="flex grow justify-end mt-2 pt-4">
            <Button
              type="submit"
              variant="primary"
              className="!py-4 !px-8 !h-max"
            >
              {localize(config.submitLabel) || t('blocks.form.submit')}
            </Button>
          </div>,
        ]}
      />
    </div>
  );
};

Form.schema = schema;

export default Form;
