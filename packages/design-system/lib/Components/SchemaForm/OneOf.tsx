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
  uiOptions?: UiOptionsOneOf
) => {
  if (!initialValue) return '0';
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
      uiOptionsOneOf
        ? uiOptionsOneOf.oneOf.options.map(({ label }, index) => ({
            label,
            value: `${index}`,
          }))
        : oneOf.map((option, index) => ({
            label: `${locales.oneOfOption || 'Option'} ${index}`,
            value: `${index}`,
          })),
    [oneOf]
  );

  const childSchema = useMemo(() => {
    const { index = 0 } = uiOptionsOneOf
      ? uiOptionsOneOf.oneOf.options[+selected]
      : { index: +selected };
    const childSchema: Schema = { ...schema, ...oneOf[index] };
    if (!oneOf[index].title) {
      delete childSchema.title;
    }
    if (!oneOf[index].description) {
      delete childSchema.description;
    }
    if (childSchema.properties && schema.properties) {
      childSchema.properties = {
        ...schema.properties,
        ...childSchema.properties,
      };
    }

    delete childSchema.oneOf;
    return childSchema;
  }, [selected]);

  useEffect(() => {
    if (!uiOptionsOneOf) return;
    const { value } = uiOptionsOneOf.oneOf.options[+selected] || {};
    if (!value || typeof value !== 'object') return;
    if (
      !Object.keys(value).every(
        (name) => value[name] === field.input.value[name]
      )
    ) {
      field.input.onChange({ ...value });
    }
  }, [selected]);

  const title = schema.title || getLabel(name);

  return (
    <Description text={schema.description} className="pt-1">
      {title && <label className="text-[10px] text-gray">{title}</label>}
      <Select selectOptions={options} onChange={setSelected} value={selected} />
      <Field schema={childSchema} name={name} label={label} />
    </Description>
  );
};

export default OneOf;
