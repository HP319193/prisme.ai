import { ReactElement, useCallback, useEffect, useMemo, useRef } from 'react';
import { Form, FormSpy } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import Field from './Field';
import { Schema, UiOptionsSelect } from './types';
import Button from '../Button';
import { root } from './utils';
import { context, SchemaFormContext, FieldContainer } from './context';
import FieldAny from './FieldAny';
import FieldBoolean from './FieldBoolean';
import FieldDate from './FieldDate';
import FieldLocalizedBoolean from './FieldLocalizedBoolean';
import FieldLocalizedText from './FieldLocalizedText';
import FieldObject from './FieldObject';
import FieldArray from './FieldArray';
import FieldSelect from './FieldSelect';
import FieldText from './FieldText';

export interface FormProps {
  schema: Schema;
  onSubmit?: (values: any) => void;
  buttons?: ReactElement[];
  onChange?: (values: any) => void;
  initialValues?: any;
  locales?: SchemaFormContext['locales'];
  components?: Partial<SchemaFormContext['components']>;
  utils?: Partial<SchemaFormContext['utils']>;
}

const OnChange = ({
  values,
  onChange,
}: {
  values: any;
  onChange: FormProps['onChange'];
}) => {
  useEffect(() => {
    if (!onChange || !values) return;
    onChange(values.values);
  }, [values]);
  return null;
};

const DefaultLocales = {};

export const SchemaForm = ({
  schema,
  onSubmit,
  buttons,
  onChange,
  initialValues,
  locales = DefaultLocales,
  components,
  utils,
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
  const componentsWithDefault = useMemo(
    () => ({
      FieldContainer,
      FieldArray,
      FieldAny,
      FieldBoolean,
      FieldDate,
      FieldLocalizedBoolean,
      FieldLocalizedText,
      FieldObject,
      FieldSelect,
      FieldText,
      ...components,
    }),
    [components]
  );

  const utilsWithDefault = useMemo(
    () => ({
      extractSelectOptions: () => [],
      ...utils,
    }),
    [utils]
  );

  return (
    <context.Provider
      value={{
        locales,
        components: componentsWithDefault,
        utils: utilsWithDefault,
      }}
    >
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
