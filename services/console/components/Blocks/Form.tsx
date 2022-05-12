import {
  Schema,
  SchemaForm,
  SchemaFormDescription,
  useBlock,
} from '@prisme.ai/design-system';
import { FieldProps } from '@prisme.ai/design-system/lib/Components/SchemaForm/types';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import { useField } from 'react-final-form';
import SchemaFormBuilder from '../SchemaFormBuilder';

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
    schema: {
      type: 'object',
      'ui:widget': SchemaField,
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

  return (
    <div className="p-8">
      <SchemaForm
        schema={config.schema || defaultSchema}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};

Form.schema = schema;

export default Form;
