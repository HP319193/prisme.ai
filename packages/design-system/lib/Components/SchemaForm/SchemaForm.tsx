import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Form, FormSpy } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import Field from './Field';
import { Schema } from './types';
import Button from '../Button';
import { root } from './utils';
import { context, SchemaFormContext } from './context';

export interface FormProps {
  schema: Schema;
  onSubmit?: (values: any) => void;
  buttons?: ReactElement[];
  onChange?: (values: any) => void;
  initialValues?: any;
  locales?: SchemaFormContext['locales'];
  components?: SchemaFormContext['components'];
}

const OnChange = ({
  values,
  onChange,
}: {
  values: any;
  onChange: FormProps['onChange'];
}) => {
  useEffect(() => {
    if (!onChange || !values || !values.values) return;
    onChange(values.values);
  }, [values]);
  return null;
};

const EmptyObject = {};

export const SchemaForm = ({
  schema,
  onSubmit,
  buttons,
  onChange,
  initialValues,
  locales = EmptyObject,
  components = EmptyObject,
}: FormProps) => {
  if (!schema) return null;
  const values = useRef({ values: initialValues });

  const onSubmitHandle = useCallback(
    (values: any) => {
      if (!onSubmit) return;
      onSubmit(values.values);
    },
    [onSubmit]
  );

  return (
    <context.Provider value={{ locales, components }}>
      <Form
        onSubmit={onSubmitHandle}
        initialValues={values.current}
        mutators={{ ...arrayMutators }}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            {onChange && (
              <FormSpy subscription={{ values: true }}>
                {({ values }) => (
                  <OnChange values={values} onChange={onChange} />
                )}
              </FormSpy>
            )}
            <Field schema={schema} name={root} />
            {buttons || (
              <Button type="submit">{locales.submit || 'Submit'}</Button>
            )}
          </form>
        )}
      </Form>
    </context.Provider>
  );
};

export default SchemaForm;
