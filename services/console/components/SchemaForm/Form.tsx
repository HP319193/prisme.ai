import { useTranslation } from 'next-i18next';
import { Button } from '@prisme.ai/design-system';
import { FC, useCallback } from 'react';
import { Form as FFForm, FormRenderProps } from 'react-final-form';
import { Field } from './Field';
import { Schema } from './types';
import { PlusOutlined } from '@ant-design/icons';

interface FormProps {
  schema: Schema;
  onSubmit: (values: any) => void;
  initialValues?: FormRenderProps['initialValues'];
  description?: string;
}
export const Form: FC<FormProps> = ({
  schema,
  onSubmit,
  description,
  ...formProps
}) => {
  const { t } = useTranslation('workspaces');
  const properties = Object.keys(schema.properties || {}).reduce(
    (prev, name) => {
      if (prev[name].type === 'array') {
        delete prev[name];
      }
      return prev;
    },
    { ...(schema.properties || {}) }
  );

  const required = (schema.required || []).filter((f) =>
    Object.keys(properties).includes(f)
  );

  const oneOf = schema.oneOf
    ? schema.oneOf.map(({ required }) => ({
        required: required.filter((f) => Object.keys(properties).includes(f)),
      }))
    : null;

  const fields = Object.keys(properties).map((field) => ({
    field,
    type: properties[field].type,
    description: properties[field].description,
    required: required.includes(field),
  }));
  const submit = useCallback(
    (values: any) => {
      let errors: Record<string, string> = {};
      if (
        !oneOf ||
        oneOf.some(({ required }) => required.every((f) => !!values[f]))
      ) {
        const parsedValues = Object.keys(
          schema.properties || properties
        ).reduce((prev, attr) => {
          const { type } = (schema.properties || properties)[attr];
          if (type === 'object' && values[attr]) {
            try {
              return {
                ...prev,
                [attr]: JSON.parse(values[attr]),
              };
            } catch (e) {
              return {
                ...prev,
                [attr]: values[attr],
              };
            }
          }
          if (type === 'array') {
            return {
              ...prev,
              [attr]: [],
            };
          }
          return {
            ...prev,
            [attr]: values[attr],
          };
        }, {});

        if (schema.required) {
          schema.required.forEach((attr) => {
            if (!parsedValues[attr as keyof typeof parsedValues]) {
              errors[attr] = 'required';
            }
          });
        }

        if (Object.keys(errors).length === 0) {
          onSubmit(parsedValues);
        }
      }

      // Check oneOf
      if (oneOf) {
        const oneOfIsValid = oneOf.some(({ required }) =>
          required.every((f) => values[f])
        );
        if (!oneOfIsValid) {
          oneOf.forEach(({ required }) => {
            required.forEach((f) => {
              if (values[f]) return;
              errors[f] = 'oneOfRequired';
            });
          });
        }
      }
      return errors;
    },
    [onSubmit, oneOf, properties, schema]
  );

  return (
    <FFForm onSubmit={submit} {...formProps}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          {description && <div>{description}</div>}
          {fields.map((field) => (
            <Field
              key={field.field}
              {...field}
              oneOf={oneOf ? oneOf : undefined}
            />
          ))}
          <Button type="submit">
            <PlusOutlined />
            {t('automations.edit.save')}
          </Button>
        </form>
      )}
    </FFForm>
  );
};

export default Form;
