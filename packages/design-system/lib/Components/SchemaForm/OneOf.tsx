import { useEffect, useMemo, useState } from 'react';
import { useField } from 'react-final-form';
import Select from '../Select';
import { useSchemaForm } from './context';
import Description from './Description';
import Field from './Field';
import { FieldProps, Schema, UiOptionsOneOf } from './types';
import { getLabel, typesMatch } from './utils';

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

export const OneOf = ({ schema, name, label }: FieldProps) => {
  const { locales = {} } = useSchemaForm();
  const field = useField(name);

  const { oneOf = [], 'ui:options': uiOptions } = schema;
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
    const cleanedSchema = { ...schema };
    delete cleanedSchema.oneOf;
    const partialSchema = oneOf[index] || {};
    const childSchema: Schema = { ...cleanedSchema, ...partialSchema };

    delete childSchema.title;
    if (!partialSchema.description) {
      delete childSchema.description;
    }
    if (childSchema.properties && schema.properties) {
      childSchema.properties = {
        ...schema.properties,
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

  const title = schema.title || getLabel(name);

  return (
    <Description text={schema.description} className="pt-1">
      <div className="flex flex-1 flex-col">
        {title && <label className="flex">{title}</label>}
        <Select
          selectOptions={options}
          onChange={setSelected}
          value={selected}
        />
        {schema.type !== undefined && (
          <Field schema={childSchema} name={name} label={label} />
        )}
      </div>
    </Description>
  );
};

export default OneOf;
