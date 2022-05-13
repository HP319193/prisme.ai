import {
  Button,
  Schema,
  SchemaForm,
  SchemaFormDescription,
  useBlock,
} from '@prisme.ai/design-system';
import { FieldProps } from '@prisme.ai/design-system/lib/Components/SchemaForm/types';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import { useField } from 'react-final-form';
import SchemaFormBuilder from '../SchemaFormBuilder';
import useLocalizedText from '../../utils/useLocalizedText';
import BlockTitle from './Components/BlockTitle';

const defaultSchema = {
  type: 'string',
  title: 'preview',
};

const defaultValue = {
  type: 'object',
  properties: {
    '': {
      type: 'string',
    },
  },
};

const SchemaField = ({ name }: FieldProps) => {
  const { t } = useTranslation('workspaces');
  const field = useField(name);
  return (
    <div className="my-4 p-4 border-[1px] border-gray-200 rounded">
      <SchemaFormDescription text={t('pages.blocks.form.schema.description')}>
        <label className="text-[10px] text-gray">
          {t('pages.blocks.form.schema.label')}
        </label>
        <SchemaFormBuilder
          {...field.input}
          value={field.input.value || defaultValue}
        />
      </SchemaFormDescription>
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
      'ui:widget': SchemaField,
    },
    submitLabel: {
      type: 'string',
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
