import { useField } from 'react-final-form';
import TextArea from '../TextArea';
import { useSchemaForm } from './context';
import Description from './Description';
import { FieldProps, UiOptionsTextArea } from './types';
import { getLabel } from './utils';

export const FieldTextTextArea = ({
  options,
  ...props
}: FieldProps & { options: UiOptionsTextArea }) => {
  const field = useField(props.name);
  const { components } = useSchemaForm();

  return (
    <Description text={props.schema.description}>
      <components.FieldContainer {...props}>
        <TextArea
          {...field.input}
          {...(options && options.textarea)}
          label={props.label || props.schema.title || getLabel(props.name)}
        />
      </components.FieldContainer>
    </Description>
  );
};

export default FieldTextTextArea;
