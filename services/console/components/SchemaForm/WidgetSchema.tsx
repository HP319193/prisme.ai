import { Schema, SchemaForm, useSchemaForm } from '@prisme.ai/design-system';
import { useEffect, useState } from 'react';
import { useField, useForm } from 'react-final-form';
import _get from 'lodash.get';
import components from './schemaFormComponents';
import equal from 'fast-deep-equal';

function computePath(path: string, values: {}) {
  return path.replace(/\{\{(.+)\}\}/g, (match, $1) => {
    return _get(values, $1);
  });
}

function cleanProperty(
  property: NonNullable<Schema['properties']>[string]
): Schema {
  if (property.type === 'object' && property.properties)
    return cleanChildSchema(property);
  if (property.type !== 'object' || property.properties) return property;
  const { type, ...cleaned } = property;
  return cleaned;
}
/**
 * Some schema like the ones from Custom Code comes with a object type but no
 * properties which leads to display an uneditable field.
 * Removing type for this kind transform field into a any wich let set any value
 * in a code editor.
 */
function cleanChildSchema(schema: Schema): Schema {
  if (schema.type === 'object') {
    return {
      ...schema,
      properties: Object.entries(schema.properties || {}).reduce(
        (prev, [key, next]) => ({
          ...prev,
          [key]: cleanProperty(next),
        }),
        {}
      ),
    };
  }
  return schema;
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
    setChildSchema((prev) => {
      if (from !== 'config' || prev) return prev;
      const childSchema = extractFromConfig(
        computePath(path, form.getState().values)
      );
      if (
        !childSchema ||
        typeof childSchema !== 'object' ||
        Array.isArray(childSchema)
      ) {
        setChildSchema(null);
        return prev;
      }
      if (childSchema.type) {
        return cleanChildSchema(childSchema);
      } else {
        return cleanChildSchema({
          ...schema,
          properties: {
            ...childSchema,
          },
        });
      }
    });
  }, [extractFromConfig, form, from, path, schema]);

  if (!childSchema) return null;
  return (
    <SchemaForm
      schema={childSchema}
      initialValues={field.input.value}
      components={{ JSONEditor: components.JSONEditor }}
      onChange={field.input.onChange}
      buttons={[]}
    />
  );
};
export default WidgetSchema;
