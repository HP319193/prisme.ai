import { Input } from 'antd';
import { useMemo } from 'react';
import { useField } from 'react-final-form';
import { LocalizedInput } from '../..';
import { SchemaFormContext, useSchemaForm } from './context';
import FieldContainer from './FieldContainer';
import FieldTextUpload from './FieldTextUpload';
import InfoBubble from './InfoBubble';
import Label from './Label';
import {
  FieldProps,
  UiOptionsHTML,
  UiOptionsTextArea,
  UiOptionsUpload,
} from './types';

export const FieldLocalizedText = ({
  HTMLEditor,
  ...props
}: FieldProps & {
  HTMLEditor: SchemaFormContext['components']['HTMLEditor'];
}) => {
  const field = useField(props.name);
  const { 'ui:widget': uiWidget, 'ui:options': uiOptions } = props.schema;
  const [, type] = (props.schema.type || '').split(':');
  const [InputComponent, InputProps] = useMemo(() => {
    const commonProps = {
      placeholder: props.schema.placeholder,
      disabled: props.schema.disabled,
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
      case 'html':
        return [
          HTMLEditor,
          {
            ...commonProps,
            ...((uiOptions || { html: {} }) as UiOptionsHTML).html,
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
        className={`pr-form-${type}__input ${
          uiWidget ? `pr-form-${type}__input--${uiWidget}` : ''
        } pr-form-input`}
        data-testid={`schema-form-field-${field.input.name}`}
      />
      <InfoBubble
        className={`pr-form-${type}__description`}
        text={props.schema.description}
      />
    </FieldContainer>
  );
};
const LinkedFieldLocalizedText = (props: FieldProps) => {
  const { components: { HTMLEditor } = {} } = useSchemaForm();
  return <FieldLocalizedText {...props} HTMLEditor={HTMLEditor} />;
};

export default LinkedFieldLocalizedText;
