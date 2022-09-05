import { ChangeEvent, useCallback } from 'react';
import { useField } from 'react-final-form';
import Input from '../Input';
import { useSchemaForm } from './context';
import Description from './Description';
import FieldAutocomplete from './FieldAutocomplete';
import FieldDate from './FieldDate';
import FieldTextColor from './FieldTextColor';
import FieldTextTextArea from './FieldTextTextArea';
import FieldTextUpload from './FieldTextUpload';
import { FieldProps, UiOptionsTextArea, UiOptionsUpload } from './types';
import { getLabel } from './utils';

export const FieldText = (props: FieldProps) => {
  const field = useField(props.name);
  const { components } = useSchemaForm();
  const { 'ui:widget': uiWidget, 'ui:options': uiOptions } = props.schema;

  const onChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      field.input.onChange(props.schema.type === 'number' ? +value : value);
    },
    [field.input.onChange, props.schema.type]
  );

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
    case 'color':
      return <FieldTextColor {...props} />;
    case 'autocomplete':
      return <FieldAutocomplete {...props} />;
  }

  return (
    <Description text={props.schema.description}>
      <components.FieldContainer {...props}>
        <Input
          {...field.input}
          onChange={onChange}
          label={props.label || props.schema.title || getLabel(props.name)}
          type={props.schema.type === 'number' ? 'number' : 'text'}
        />
      </components.FieldContainer>
    </Description>
  );
};

export default FieldText;
