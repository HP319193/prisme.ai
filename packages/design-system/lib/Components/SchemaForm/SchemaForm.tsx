import {
  Children,
  cloneElement,
  MutableRefObject,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Form } from 'react-final-form';
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
import FieldTags from './FieldTags';
import FieldSelect from './FieldSelect';
import FieldRadio from './FieldRadio';
import FieldText from './FieldText';
import { OnChange } from 'react-final-form-listeners';
import { FormApi } from 'final-form';

export interface SchemaFormProps {
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
  formRef?: MutableRefObject<FormApi<any, any>>;
  initialFieldObjectVisibility?: boolean;
}

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
  formRef,
  initialFieldObjectVisibility = true,
}: SchemaFormProps) => {
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
      FieldObject: FieldObject(initialFieldObjectVisibility),
      FieldTags,
      FieldSelect,
      FieldRadio,
      FieldText,
      UiWidgets: {},
      ...components,
    }),
    [components, initialFieldObjectVisibility]
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
        {({ handleSubmit, hasValidationErrors, form }) => {
          formRef && (formRef.current = form);
          return (
            <form
              onSubmit={handleSubmit}
              className={`pr-form ${
                hasValidationErrors ? 'pr-form--has-validation-errors' : ''
              }`}
            >
              {onChange && (
                <OnChange name="values">
                  {(value, previous) => {
                    if (previous === value) return;
                    onChange(value);
                  }}
                </OnChange>
              )}
              <Field schema={schema} name={root} />
              {buttons ? (
                Children.map(buttons, (button, key) =>
                  cloneElement(button, {
                    key: button.key || key,
                  })
                )
              ) : (
                <Button
                  type="submit"
                  className="pr-form-submit"
                  disabled={hasValidationErrors}
                >
                  {locales.submit || 'Submit'}
                </Button>
              )}
            </form>
          );
        }}
      </Form>
    </context.Provider>
  );
};

export default SchemaForm;
