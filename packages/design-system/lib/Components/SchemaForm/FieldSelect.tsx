import { useCallback, useMemo } from 'react';
import { useField } from 'react-final-form';
import Select, { SelectProps } from '../Select';
import Description from './Description';
import { FieldProps, Schema, UiOptionsSelect } from './types';
import { getLabel } from './utils';

function isUiOptionsSelect(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsSelect {
  return !!uiOptions && !!(uiOptions as UiOptionsSelect).select;
}

export const FieldSelect = ({
  schema,
  label,
  name,
  options,
}: FieldProps & { options?: SelectProps['selectOptions'] }) => {
  const field = useField(name);

  const selectOptions = useMemo(() => {
    if (options) return options;
    const { 'ui:options': uiOptions } = schema;
    if (!isUiOptionsSelect(uiOptions)) return [];
    return uiOptions.select.options || [];
  }, []);

  return (
    <Description text={schema.description}>
      <label className="text-[10px] text-gray">
        {label || schema.title || getLabel(name)}
      </label>
      <Select selectOptions={selectOptions} onChange={field.input.onChange} />
    </Description>
  );
};

export default FieldSelect;
