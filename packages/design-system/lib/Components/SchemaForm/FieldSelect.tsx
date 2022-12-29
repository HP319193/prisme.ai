import { useMemo } from 'react';
import { useField } from 'react-final-form';
import Select, { SelectProps } from '../Select';
import { useSchemaForm } from './context';
import Description from './Description';
import { FieldProps, Schema, UiOptionsSelect } from './types';
import { getLabel } from './utils';

function isUiOptionsSelect(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsSelect {
  return !!uiOptions && !!(uiOptions as UiOptionsSelect).select;
}

export function useSelectOptions(
  schema: Schema,
  options?: SelectProps['selectOptions']
) {
  const {
    utils: { extractSelectOptions },
  } = useSchemaForm();

  return useMemo(() => {
    if (options) return options;
    const { 'ui:options': uiOptions } = schema;
    if (isUiOptionsSelect(uiOptions)) return uiOptions.select.options;

    const _options = extractSelectOptions(schema);

    return Array.isArray(_options) ? _options : [];
  }, [extractSelectOptions]);
}

export const FieldSelect = ({
  schema,
  label,
  name,
  options,
}: FieldProps & { options?: SelectProps['selectOptions'] }) => {
  const field = useField(name);
  const selectOptions = useSelectOptions(schema, options);

  return (
    <Description text={schema.description}>
      <Select
        value={field.input.value}
        selectOptions={selectOptions}
        onChange={field.input.onChange}
        label={label || schema.title || getLabel(name)}
      />
    </Description>
  );
};

export default FieldSelect;
