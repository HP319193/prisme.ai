import { useEffect, useMemo, useState } from 'react';
import { useField } from 'react-final-form';
import Select from '../Select';
import { SchemaFormContext, useSchemaForm } from './context';
import Field from './Field';
import { FieldProps, Schema, UiOptionsOneOf } from './types';
import { getLabel, typesMatch } from './utils';
import FieldContainer from './FieldContainer';

function isUiOptionsOneOf(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsOneOf {
  return !!uiOptions && !!(uiOptions as UiOptionsOneOf).oneOf;
}

const getInitialIndex = (
  initialValue: any,
  oneOf: Schema['oneOf'] = [],
  // @deprecated
  uiOptions?: UiOptionsOneOf
) => {
  if (!initialValue) return '0';

  // Deprecated
  if (uiOptions && uiOptions.oneOf.options.some(({ value }) => value)) {
    const index = (uiOptions.oneOf.options || []).findIndex(({ value }) => {
      if (!value) return false;
      const match = Object.keys(value).every(
        (name) => value[name] === initialValue[name]
      );
      return match;
    });
    return `${Math.max(0, index)}`;
  }

  // from oneOf value
  const oneOfValue = oneOf.findIndex(({ value }) => value === initialValue);

  if (oneOfValue > -1) return `${oneOfValue}`;

  // Check types
  const index = oneOf.findIndex((schema) => typesMatch(schema, initialValue));
  return `${Math.max(0, index)}`;
};

export const OneOf = ({
  locales,
  ...props
}: FieldProps & { locales: SchemaFormContext['locales'] }) => {
  const field = useField(props.name);

  const { oneOf = [], 'ui:options': uiOptions } = props.schema;
  const [selected, setSelected] = useState(
    getInitialIndex(
      field.input.value,
      oneOf,
      isUiOptionsOneOf(uiOptions) ? uiOptions : undefined
    )
  );

  const uiOptionsOneOf = isUiOptionsOneOf(uiOptions) ? uiOptions : null;

  const options = useMemo(
    () =>
      oneOf.map((option, index) => ({
        label:
          uiOptionsOneOf?.oneOf?.options?.[index]?.label ||
          option.title ||
          `${locales.oneOfOption || 'Option'} ${index}`,
        value: `${index}`,
      })),
    [oneOf, uiOptionsOneOf]
  );

  const childSchema = useMemo(() => {
    const { index = 0 } = uiOptionsOneOf
      ? uiOptionsOneOf.oneOf.options[+selected]
      : { index: +selected };
    const cleanedSchema = { ...props.schema };
    delete cleanedSchema.oneOf;
    const partialSchema = oneOf[index] || {};
    const childSchema: Schema = { ...cleanedSchema, ...partialSchema };

    delete childSchema.title;
    if (!partialSchema.description) {
      delete childSchema.description;
    }
    if (childSchema.properties && props.schema.properties) {
      childSchema.properties = {
        ...props.schema.properties,
        ...childSchema.properties,
      };
    }

    return childSchema;
  }, [selected]);

  useEffect(() => {
    const value = oneOf?.[isNaN(+selected) ? 0 : +selected]?.value;
    if (value === undefined) return;
    setTimeout(() => field.input.onChange(value));
  }, [selected]);

  useEffect(() => {
    // Deprecated
    if (!uiOptionsOneOf) return;
    const { value } = uiOptionsOneOf.oneOf.options[+selected] || {};

    if (!value || typeof value !== 'object') return;

    const newValue: typeof value = Object.keys(
      childSchema.properties || {}
    ).reduce(
      (prev, key) => ({
        ...prev,
        [key]: value[key] || field.input.value[key],
      }),
      {}
    );

    if (
      !Object.keys(newValue).every(
        (name) => newValue[name] === field.input.value[name]
      )
    ) {
      field.input.onChange({ ...newValue });
    }
  }, [selected]);

  const title = props.schema.title || getLabel(props.name);

  return (
    <FieldContainer {...props} className="pr-form-one-of">
      <label className="pr-form-label pr-form-one-of__label">{title}</label>
      <div className="pr-form-input pr-form-one-of__input">
        <Select
          selectOptions={options}
          onChange={setSelected}
          value={selected}
        />
      </div>
      {props.schema.type !== undefined && (
        <Field schema={childSchema} name={props.name} label={props.label} />
      )}
    </FieldContainer>
  );
};

const Linked = (props: FieldProps) => {
  const { locales = {} } = useSchemaForm();
  return <OneOf {...props} locales={locales} />;
};
export default Linked;
