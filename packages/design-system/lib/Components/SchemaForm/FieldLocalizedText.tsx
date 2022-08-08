import { useMemo } from 'react';
import { useField } from 'react-final-form';
import { LocalizedInput } from '../..';
import TextArea from '../TextArea';
import Description from './Description';
import FieldTextUpload from './FieldTextUpload';
import { FieldProps, UiOptionsTextArea, UiOptionsUpload } from './types';
import { getLabel } from './utils';

export const FieldLocalizedText = (props: FieldProps) => {
  const field = useField(props.name);
  const { 'ui:widget': uiWidget, 'ui:options': uiOptions } = props.schema;
  const [Input, InputProps] = useMemo(() => {
    const commonProps = {
      label: props.label || props.schema.title || getLabel(props.name),
      containerClassName: 'flex flex-1',
      type: props.schema.type === 'number' ? 'number' : 'text',
    };
    switch (uiWidget) {
      case 'textarea':
        return [
          TextArea,
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
        return [undefined, commonProps];
    }
  }, [uiWidget]);

  return (
    <Description text={props.schema.description}>
      <LocalizedInput
        {...field.input}
        Input={Input}
        InputProps={InputProps}
        iconMarginTop="2.3rem"
      />
    </Description>
  );
};

export default FieldLocalizedText;
