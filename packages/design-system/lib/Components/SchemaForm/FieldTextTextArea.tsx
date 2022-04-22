import { useField } from 'react-final-form';
import TextArea from '../TextArea';
import Description from './Description';
import { FieldProps, UiOptionsTextArea } from './types';
import { getLabel } from './utils';

export const FieldTextTextArea = ({
  schema,
  label,
  name,
  options,
}: FieldProps & { options: UiOptionsTextArea }) => {
  const field = useField(name);

  return (
    <Description text={schema.description}>
      <TextArea
        {...field.input}
        {...(options && options.textarea)}
        label={label || schema.title || getLabel(name)}
      />
    </Description>
  );
};

export default FieldTextTextArea;
