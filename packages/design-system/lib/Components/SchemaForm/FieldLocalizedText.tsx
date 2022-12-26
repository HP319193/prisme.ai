import { Input } from 'antd';
import { useMemo } from 'react';
import { useField } from 'react-final-form';
import { LocalizedInput } from '../..';
import FieldContainer from './FieldContainer';
import FieldTextUpload from './FieldTextUpload';
import InfoBubble from './InfoBubble';
import Label from './Label';
import { FieldProps, UiOptionsTextArea, UiOptionsUpload } from './types';

export const FieldLocalizedText = (props: FieldProps) => {
  const field = useField(props.name);
  const { 'ui:widget': uiWidget, 'ui:options': uiOptions } = props.schema;
  const [, type] = (props.schema.type || '').split(':');
  const [InputComponent, InputProps] = useMemo(() => {
    const commonProps = {
      type: type === 'number' ? 'number' : 'text',
    };
    switch (uiWidget) {
      case 'textarea':
        return [
          Input.TextArea,
          {
            ...commonProps,
            ...((uiOptions || { textarea: {} }) as UiOptionsTextArea).textarea,
          },
        ];
      case 'upload':
        return [
          FieldTextUpload,
          {
            ...commonProps,
            ...((uiOptions || { upload: {} }) as UiOptionsUpload).upload,
          },
        ];
      default:
        return [Input, commonProps];
    }
  }, [uiWidget]);

  return (
    <FieldContainer
      {...props}
      className={`pr-form-${type} pr-form-${type}--localized`}
    >
      <Label
        field={field}
        schema={props.schema}
        className={`pr-form-${type}__label pr-form-label`}
      >
        {props.label}
      </Label>
      <LocalizedInput
        {...field.input}
        Input={InputComponent}
        InputProps={InputProps}
        iconMarginTop="2.3rem"
        className={`pr-form-${type}__input pr-form-input`}
      />
      <InfoBubble
        className={`pr-form-${type}__description`}
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

export default FieldLocalizedText;
