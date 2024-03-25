import { useField } from 'react-final-form';
import { FieldProps, UiOptionsPassword } from './types';
import { Label } from './Label';
import { Input, Tooltip } from 'antd';
import InfoBubble from './InfoBubble';
import FieldContainer from './FieldContainer';
import { getError } from './utils';

const { Password } = Input;

export const FieldTextTextArea = ({
  options,
  ...props
}: FieldProps & { options: UiOptionsPassword }) => {
  const field = useField(props.name);
  const hasError = getError(field.meta);

  return (
    <FieldContainer {...props} className="pr-form-text pr-form-text--password">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-text__label pr-form-label"
      >
        {props.label}
      </Label>
      <Tooltip title={hasError} overlayClassName="pr-form-error">
        <Password
          {...field.input}
          {...(options && options.password)}
          placeholder={props.schema.placeholder || ''}
          id={field.input.name}
          status={hasError ? 'error' : ''}
          disabled={props.schema.disabled}
          className="pr-form-text__input pr-form-input"
        />
      </Tooltip>
      <InfoBubble
        className="pr-form-text__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

export default FieldTextTextArea;
