import { Schema, SchemaForm, useSchemaForm } from '@prisme.ai/design-system';
import { useEffect, useState } from 'react';
import { useField, useForm } from 'react-final-form';
import _get from 'lodash.get';

function computePath(path: string, values: {}) {
  return path.replace(/\{\{(.+)\}\}/g, (match, $1) => {
    return _get(values, $1);
  });
}

export const WidgetSchema = ({ name, schema }: any) => {
  const form = useForm();
  const field = useField(name);
  const { from, path } = schema['ui:options'] || {};
  const {
    utils: { extractFromConfig },
  } = useSchemaForm();
  const [childSchema, setChildSchema] = useState<Schema | null>(null);

  useEffect(() => {
    if (from !== 'config') return;
    const schema = extractFromConfig(computePath(path, form.getState().values));
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
      setChildSchema(null);
      return;
    }
    if (schema.type) {
      setChildSchema(schema);
    } else {
      setChildSchema({
        type: 'object',
        properties: schema,
      });
    }
  }, [extractFromConfig, form, from, path, schema]);

  useEffect(() => {
    if (!childSchema) {
      field.input.onChange(undefined);
    }
  }, [childSchema, field.input]);

  if (!childSchema) return null;
  return (
    <SchemaForm
      schema={childSchema}
      initialValues={field.input.value}
      onChange={field.input.onChange}
      buttons={[]}
    />
  );
};
export default WidgetSchema;
