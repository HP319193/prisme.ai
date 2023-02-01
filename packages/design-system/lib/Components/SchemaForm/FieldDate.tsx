import { useField } from 'react-final-form';
import DatePicker from '../DatePicker';
import FieldContainer from './FieldContainer';
import InfoBubble from './InfoBubble';
import { Label } from './Label';
import { FieldProps, Schema, UiOptionsDate } from './types';

function isUiOptionsDate(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsDate {
  return !!uiOptions && !!(uiOptions as UiOptionsDate).date;
}

export const FieldDate = (props: FieldProps) => {
  const field = useField(props.name);
  const { 'ui:options': uiOptions } = props.schema;

  return (
    <FieldContainer {...props} className="pr-form-date">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-date__label pr-form-label"
      >
        {props.label}
      </Label>
      <div className="pr-form-date__input pr-form-input">
        <DatePicker
          stringValue={field.input.value}
          onChange={(date) => field.input.onChange(date && date.toDate())}
          {...(uiOptions && isUiOptionsDate(uiOptions)
            ? uiOptions.date
            : undefined)}
          className="!flex-[unset]"
          placeholder={props.schema.placeholder}
        />
      </div>
      <InfoBubble
        className="pr-form-date__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

export default FieldDate;
