import { useField } from 'react-final-form';
import Input from '../Input';
import { useSchemaForm } from './context';
import Description from './Description';
import FieldDate from './FieldDate';
import FieldTextTextArea from './FieldTextTextArea';
import FieldTextUpload from './FieldTextUpload';
import { FieldProps, UiOptionsTextArea, UiOptionsUpload } from './types';
import { getLabel } from './utils';

export const FieldText = (props: FieldProps) => {
  const field = useField(props.name);
  const { components } = useSchemaForm();
  const { 'ui:widget': uiWidget, 'ui:options': uiOptions } = props.schema;

  switch (uiWidget) {
    case 'textarea':
      return (
        <FieldTextTextArea
          {...props}
          options={(uiOptions || { textarea: {} }) as UiOptionsTextArea}
        />
      );
    case 'upload':
      return (
        <FieldTextUpload
          {...props}
          options={(uiOptions || { upload: {} }) as UiOptionsUpload}
        />
      );
    case 'date':
      const Component = components.FieldDate || FieldDate;
      return <Component {...props} />;
  }

  return (
    <Description text={props.schema.description}>
      <Input
        {...field.input}
        label={props.label || props.schema.title || getLabel(props.name)}
        containerClassName="flex flex-1"
        type={props.schema.type === 'number' ? 'number' : 'text'}
      />
    </Description>
  );
};

export default FieldText;
