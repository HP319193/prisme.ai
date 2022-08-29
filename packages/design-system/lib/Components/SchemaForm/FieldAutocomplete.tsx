import { useField } from 'react-final-form';
import { AutoComplete } from 'antd';
import Description from './Description';
import {
  FieldProps,
  Schema,
  UiOptionsAutocomplete,
  UiOptionsDynamicAutocomplete,
} from './types';
import { getLabel } from './utils';
import { useMemo } from 'react';
import { useSchemaForm } from './context';
import { Input } from '../..';

function isUiOptionsAutocomplete(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsAutocomplete {
  const opt = uiOptions as UiOptionsAutocomplete;
  return !!opt && !!opt.autocomplete && typeof opt.autocomplete === 'object';
}

function isUiOptionsDynamicAutocomplete(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsDynamicAutocomplete {
  const opt = uiOptions as UiOptionsAutocomplete;
  return !!opt && !!opt.autocomplete && typeof opt.autocomplete === 'string';
}

export const FieldAutocomplete = ({ schema, name, label }: FieldProps) => {
  const {
    utils: { extractAutocompleteOptions },
  } = useSchemaForm();
  const field = useField(name);
  const { 'ui:options': uiOptions } = schema;
  const options = useMemo(() => {
    if (isUiOptionsDynamicAutocomplete(uiOptions)) {
      return extractAutocompleteOptions(schema) || [];
    }
    if (isUiOptionsAutocomplete(uiOptions))
      return uiOptions.autocomplete.options || [];

    return [];
  }, [extractAutocompleteOptions, schema, uiOptions]);

  return (
    <Description text={schema.description} className="flex flex-1">
      <AutoComplete
        className="!flex flex-1 cursor-default schema-form-autocomplete"
        options={options}
        value={field.input.value}
        onSelect={field.input.onChange}
        onChange={field.input.onChange}
        filterOption={(inputValue, option) =>
          `${option?.value || ''}`
            .toUpperCase()
            .indexOf(`${inputValue || ''}`.toUpperCase()) !== -1
        }
      >
        <Input label={label || schema.title || getLabel(name)} />
      </AutoComplete>
    </Description>
  );
};

export default FieldAutocomplete;
