import { Switch } from 'antd';
import { useField } from 'react-final-form';
import { LocalizedInput } from '../..';
import FieldContainer from './FieldContainer';
import InfoBubble from './InfoBubble';
import Label from './Label';
import { FieldProps } from './types';

const LocalizedSwitch = ({
  value,
  onChange,
  id,
}: {
  value: boolean;
  onChange: any;
  id: string;
}) => {
  return (
    <Switch
      checked={value}
      onChange={(checked) => onChange({ target: { value: checked } })}
      id={id}
    />
  );
};

export const FieldLocalizedBoolean = (props: FieldProps) => {
  const field = useField(props.name);

  return (
    <FieldContainer
      {...props}
      className="pr-form-boolean pr-form-boolean--localized"
    >
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-boolean__label pr-form-label"
      >
        {props.label}
      </Label>
      <LocalizedInput
        {...field.input}
        Input={LocalizedSwitch}
        InputProps={{ ...props, id: field.input.name }}
        className="pr-form-boolean__input pr-form-input"
      />
      <InfoBubble
        className="pr-form-boolean__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

export default FieldLocalizedBoolean;
