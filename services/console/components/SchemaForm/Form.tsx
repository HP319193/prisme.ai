import { useTranslation } from 'next-i18next';
import { Button } from '@prisme.ai/design-system';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { Form as FFForm, FormRenderProps } from 'react-final-form';
import { Schema } from './types';
import { PlusOutlined } from '@ant-design/icons';
import arrayMutators from 'final-form-arrays';
import Layout from './Layout';

interface FormProps {
  schema: Schema;
  onSubmit: (values: any) => void;
  initialValues?: FormRenderProps['initialValues'];
  description?: string;
  submitLabel?: string | ReactNode;
  buttons?: ReactNode;
  formClassName?: string;
  formFieldsClassName?: string;
}
export const Form: FC<FormProps> = ({
  schema,
  onSubmit,
  description,
  initialValues = {},
  submitLabel,
  buttons,
  formClassName,
  formFieldsClassName,
  ...formProps
}) => {
  const { t } = useTranslation('workspaces');

  const { properties = {} } = schema;

  const required = (schema.required || []).filter((f) =>
    Object.keys(properties).includes(f)
  );

  const oneOf = schema.oneOf
    ? schema.oneOf.map(({ required = [] }) => ({
        required: required.filter((f) => Object.keys(properties).includes(f)),
      }))
    : null;

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
              [attr]: values[attr],
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
          return onSubmit(parsedValues);
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

  const fields: (Schema & { field: string })[] = useMemo(
    () =>
      Object.keys(properties).map((field) => ({
        field,
        ...properties[field],
      })),
    [properties]
  );

  return (
    <FFForm
      onSubmit={submit}
      initialValues={initialValues}
      {...formProps}
      mutators={{ ...arrayMutators }}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} className={formClassName}>
          <div className={formFieldsClassName}>
            {description && <div>{description}</div>}
            <Layout
              options={schema['ui:options']}
              fields={fields}
              required={required}
            />
          </div>
          {buttons || (
            <Button type="submit">
              {submitLabel || (
                <>
                  <PlusOutlined />
                  {t('automations.edit.save')}
                </>
              )}
            </Button>
          )}
        </form>
      )}
    </FFForm>
  );
};

export default Form;
