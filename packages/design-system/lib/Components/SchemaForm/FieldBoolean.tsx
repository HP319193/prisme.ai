import { Switch } from 'antd';
import { useField } from 'react-final-form';
import { FieldProps } from './types';
import FieldContainer from './FieldContainer';
import Label from './Label';
import InfoBubble from './InfoBubble';

export const FieldBoolean = (props: FieldProps) => {
  const field = useField(props.name);

  return (
    <FieldContainer {...props} className="pr-form-boolean">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-boolean__label pr-form-label"
      >
        {props.label}
      </Label>

      <Switch
        {...field.input}
        checked={field.input.value}
        disabled={props.schema.disabled}
        className="pr-form-boolean__input pr-form-input"
        id={field.input.name}
        data-testid={`schema-form-field-${field.input.name}`}
      />
      <InfoBubble
        className="pr-form-boolean__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

export default FieldBoolean;
