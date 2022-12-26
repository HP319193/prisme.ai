import { ReactElement, useCallback, useEffect, useMemo, useRef } from 'react';
import { Form, FormSpy } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import Field from './Field';
import { Schema } from './types';
import Button from '../Button';
import { root } from './utils';
import { context, FieldContainer, SchemaFormContext } from './context';
import FieldAny from './FieldAny';
import FieldBoolean from './FieldBoolean';
import FieldDate from './FieldDate';
import FieldLocalizedBoolean from './FieldLocalizedBoolean';
import FieldLocalizedText from './FieldLocalizedText';
import FieldObject from './FieldObject';
import FieldArray from './FieldArray';
import FieldSelect from './FieldSelect';
import FieldRadio from './FieldRadio';
import FieldText from './FieldText';
import {
  FreeAdditionalProperties,
  ManagedAdditionalProperties,
} from './FieldAdditionalProperties';

export interface FormProps {
  schema: Schema;
  onSubmit?: (
    values: any
  ) => void | Record<string, any> | Promise<Record<string, any>>;
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
  const dirty = useRef(false);
  useEffect(() => {
    const { current: isDirty } = dirty;
    dirty.current = true;
    if (!isDirty || !onChange || !values) return;
    onChange(values.values);
  }, [values, onChange, dirty]);
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
    async (values: any) => {
      if (!onSubmit) return;
      const errors = await onSubmit(values.values);
      if (!errors) return;
      return { values: errors };
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
      FieldRadio,
      FieldText,
      FreeAdditionalProperties,
      ManagedAdditionalProperties,
      ...components,
    }),
    [components]
  );

  const utilsWithDefault = useMemo(
    () => ({
      extractSelectOptions: () => [],
      extractAutocompleteOptions: () => [],
      uploadFile: async (file: string) => file,
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
          <form onSubmit={handleSubmit} className="pr-form">
            {onChange && (
              <FormSpy subscription={{ values: true }}>
                {({ values }) => (
                  <OnChange values={values} onChange={onChange} />
                )}
              </FormSpy>
            )}
            <Field schema={schema} name={root} />
            {buttons || (
              <Button type="submit" className="!p-1">
                {locales.submit || 'Submit'}
              </Button>
            )}
          </form>
        )}
      </Form>
    </context.Provider>
  );
};

export default SchemaForm;
