import { useField } from 'react-final-form';
import { FieldProps, UiOptionsTextArea } from './types';
import { Label } from './Label';
import { Input, Tooltip } from 'antd';
import InfoBubble from './InfoBubble';
import FieldContainer from './FieldContainer';
import { getError } from './utils';

const { TextArea } = Input;

export const FieldTextTextArea = ({
  options,
  ...props
}: FieldProps & { options: UiOptionsTextArea }) => {
  const field = useField(props.name);
  const hasError = getError(field.meta);

  return (
    <FieldContainer {...props} className="pr-form-text pr-form-text--textarea">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-text__label pr-form-label"
      >
        {props.label}
      </Label>
      <div className="pr-form-text__input pr-form-input">
        <Tooltip title={hasError} overlayClassName="pr-form-error">
          <TextArea
            {...field.input}
            {...(options && options.textarea)}
            placeholder={props.schema.placeholder || ''}
            id={field.input.name}
            autoSize={!options?.textarea?.rows}
            status={hasError ? 'error' : ''}
            disabled={props.schema.disabled}
          />
        </Tooltip>
      </div>
      <InfoBubble
        className="pr-form-text__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

export default FieldTextTextArea;
