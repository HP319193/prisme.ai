import { useField } from 'react-final-form';
import { AutoComplete, Input, Tooltip } from 'antd';
import {
  FieldProps,
  Schema,
  UiOptionsAutocomplete,
  UiOptionsDynamicAutocomplete,
} from './types';
import { useCallback, useMemo, useState } from 'react';
import { SchemaFormContext, useSchemaForm } from './context';
import FieldContainer from './FieldContainer';
import Label from './Label';
import InfoBubble from './InfoBubble';
import { getError } from './utils';

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

export const FieldAutocomplete = ({
  extractAutocompleteOptions,
  ...props
}: FieldProps & {
  extractAutocompleteOptions: SchemaFormContext['utils']['extractAutocompleteOptions'];
}) => {
  const field = useField(props.name);
  const { 'ui:options': uiOptions } = props.schema;
  const options = useMemo(() => {
    if (isUiOptionsDynamicAutocomplete(uiOptions)) {
      return extractAutocompleteOptions(props.schema) || [];
    }
    if (isUiOptionsAutocomplete(uiOptions))
      return uiOptions.autocomplete.options || [];

    return [];
  }, [extractAutocompleteOptions, props.schema, uiOptions]);
  const hasError = getError(field.meta);
  const minChars = +(
    ((uiOptions || {}) as UiOptionsAutocomplete)?.autocomplete?.minChars || 1
  );
  const [filteredOptions, setFilteredOptions] = useState<typeof options>([]);
  const filterOptions = useCallback(
    (v: string) => {
      if (v.length < minChars) return setFilteredOptions([]);
      setFilteredOptions(
        options.filter(({ label, value }) =>
          `${label} ${value}`.toLowerCase().includes(v.toLowerCase())
        )
      );
    },
    [options]
  );

  return (
    <FieldContainer {...props} className="pr-form-autocomplete">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-autocomplete__label pr-form-label"
      >
        {props.label}
      </Label>
      <Tooltip title={hasError} overlayClassName="pr-form-error">
        <AutoComplete
          className="pr-form-autocomplete__input pr-form-input"
          options={filteredOptions}
          value={field.input.value}
          onSelect={field.input.onChange}
          onChange={field.input.onChange}
          onSearch={filterOptions}
        >
          <Input
            status={hasError ? 'error' : ''}
            data-testid={`schema-form-field-${field.input.name}`}
          />
        </AutoComplete>
      </Tooltip>
      <InfoBubble
        className="pr-form-autocomplete__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

const LinkedFieldAutocomplete = (props: FieldProps) => {
  const {
    utils: { extractAutocompleteOptions },
  } = useSchemaForm();

  return (
    <FieldAutocomplete
      {...props}
      extractAutocompleteOptions={extractAutocompleteOptions}
    />
  );
};

export default LinkedFieldAutocomplete;
