import { Button } from 'primereact/button';
import { FC, useCallback } from 'react'
import { Form as FFForm, FormRenderProps } from 'react-final-form';
import { Field } from './Field';
import { Schema } from './types';

interface FormProps extends Pick<FormRenderProps, 'initialValues'> {
  schema: Schema;
  onSubmit: (values: any) => void;
}
export const Form: FC<FormProps> = ({ schema, onSubmit, ...formProps }) => {
  const properties = Object.keys(schema.properties || {})
    .reduce((prev, name) => {
      if (prev[name].type === 'array') {
        delete prev[name];
      }
      return prev;
    }, { ...schema.properties || {} })

  const required = (schema.required || [])
    .filter(f => Object.keys(properties).includes(f))

  const oneOf = schema.oneOf
    ? schema.oneOf.map(({ required }) => ({
      required: required.filter(f => Object.keys(properties).includes(f))
    })) : null

  const fields = Object.keys(properties).map(field => ({
    field,
    type: properties[field].type,
    required: required.includes(field)
  }));
  const submit = useCallback((values: any) => {
    let errors: Record<string, string> = {}
    if (!oneOf || oneOf.some(({ required }) => required.every(f => !!values[f]))) {
      const parsedValues = Object.keys(schema.properties || properties).reduce((prev, attr) => {
        const { type } = (schema.properties || properties)[attr]
        if (type === 'object' && values[attr]) {
          try {
            return {
              ...prev,
              [attr]: JSON.parse(values[attr])
            };
          } catch (e) {
            errors[attr] = 'invalid object';
          }
        }
        if (type === 'array') {
          return {
            ...prev,
            [attr]: []
          }
        }
        return {
          ...prev,
          [attr]: values[attr]
        };
      }, {});
      if (Object.keys(errors).length === 0) {
        onSubmit(parsedValues)
      }

    }

    // Check oneOf
    if (oneOf) {
      oneOf.forEach(({ required }) => {
        required.forEach((f => {
          errors[f] = 'oneOfRequired'
        }))
      })
    }
    return errors
  }, [onSubmit, oneOf, properties, schema.properties])

  return <FFForm onSubmit={submit} {...formProps}>
    {({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        {
          fields.map(field => (
            <Field
              key={field.field}
              {...field}
              oneOf={oneOf ? oneOf : undefined}
            />)
          )
        }
        <Button type="submit">Enregistrer</Button>
      </form>
    )}
  </FFForm>
}

export default Form;
