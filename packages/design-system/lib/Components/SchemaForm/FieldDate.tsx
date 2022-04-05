import { useField } from 'react-final-form';
import DatePicker from '../DatePicker';
import Description from './Description';
import { FieldProps, Schema, UiOptionsDate } from './types';
import { getLabel } from './utils';

function isUiOptionsDate(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsDate {
  return !!uiOptions && !!(uiOptions as UiOptionsDate).date;
}

export const FieldDate = ({ schema, name, label }: FieldProps) => {
  const field = useField(name);
  const { 'ui:options': uiOptions } = schema;

  return (
    <Description text={schema.description} className="flex flex-1">
      <DatePicker
        label={label || schema.title || getLabel(name)}
        stringValue={field.input.value}
        onChange={(date) => field.input.onChange(date && date.toDate())}
        {...(uiOptions && isUiOptionsDate(uiOptions)
          ? uiOptions.date
          : undefined)}
      />
    </Description>
  );
};

export default FieldDate;
