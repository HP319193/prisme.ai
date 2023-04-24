import { useCallback, useMemo } from 'react';
import { useField } from 'react-final-form';
import Select, { SelectProps } from '../Select';
import { useSchemaForm } from './context';
import { FieldProps, Schema, UiOptionsSelect } from './types';
import { Label } from './Label';
import InfoBubble from './InfoBubble';
import FieldContainer from './FieldContainer';

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
    if (isUiOptionsSelect(uiOptions)) return uiOptions.select?.options;

    const _options = extractSelectOptions(schema);

    return Array.isArray(_options) ? _options : [];
  }, [extractSelectOptions]);
}

export const FieldSelect = (
  props: FieldProps & { options?: SelectProps['selectOptions'] }
) => {
  const field = useField(props.name);
  const selectOptions = useSelectOptions(props.schema, props.options);

  const filterOption = useCallback(
    (input, option) =>
      `${option?.label || ''} ${option?.value || ''}`
        .toLowerCase()
        .includes(input.toLowerCase()),
    []
  );

  const fieldOptions = isUiOptionsSelect(props.schema['ui:options'])
    ? props.schema['ui:options']
    : undefined;
  const showSearch = !fieldOptions?.select?.hideSearch;

  console.log('props.schema', props.schema);

  return (
    <FieldContainer {...props} className="pr-form-select">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-select__label pr-form-label"
      >
        {props.label}
      </Label>
      <Select
        selectOptions={selectOptions || []}
        value={field.input.value}
        onChange={field.input.onChange}
        id={field.input.name}
        className="pr-form-select__input pr-form-input"
        placeholder={props.schema.placeholder || ''}
        showSearch={showSearch}
        filterOption={filterOption}
      />
      <InfoBubble
        className="pr-form-select__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

export default FieldSelect;
