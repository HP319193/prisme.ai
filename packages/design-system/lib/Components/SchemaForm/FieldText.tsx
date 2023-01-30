import { Input, Tooltip } from 'antd';
import { ChangeEvent, useCallback } from 'react';
import { useField } from 'react-final-form';
import { SchemaFormContext, useSchemaForm } from './context';
import FieldAutocomplete from './FieldAutocomplete';
import DefaultFieldDate from './FieldDate';
import FieldTextColor from './FieldTextColor';
import FieldTextTextArea from './FieldTextTextArea';
import FieldTextUpload from './FieldTextUpload';
import {
  FieldProps,
  UiOptionsSlider,
  UiOptionsTextArea,
  UiOptionsUpload,
} from './types';
import { getError } from './utils';
import InfoBubble from './InfoBubble';
import { Label } from './Label';
import FieldContainer from './FieldContainer';
import FieldHTML from './FieldHTML';
import FieldSlider from './FieldSlider';

export const FieldText = ({
  FieldDate = DefaultFieldDate,
  ...props
}: FieldProps & {
  FieldDate: SchemaFormContext['components']['FieldDate'];
}) => {
  const field = useField(props.name);
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
      return <FieldDate {...props} />;
    case 'color':
      return <FieldTextColor {...props} />;
    case 'autocomplete':
      return <FieldAutocomplete {...props} />;
    case 'html':
      return <FieldHTML {...props} />;
    case 'slider':
      return (
        <FieldSlider
          {...props}
          options={(uiOptions || { slider: {} }) as UiOptionsSlider}
        />
      );
  }

  const hasError = getError(field.meta);

  return (
    <FieldContainer {...props} className="pr-form-text">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-text__label pr-form-label"
      >
        {props.label}
      </Label>
      <Tooltip title={hasError} overlayClassName="pr-form-error">
        <Input
          {...field.input}
          placeholder={props.schema.placeholder || ''}
          onChange={onChange}
          type={props.schema.type === 'number' ? 'number' : 'text'}
          disabled={props.schema.disabled}
          status={hasError ? 'error' : ''}
          className="pr-form-text__input pr-form-input"
          id={field.input.name}
        />
      </Tooltip>
      <InfoBubble
        className="pr-form-text__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

const LinkedFieldText = (props: FieldProps) => {
  const {
    components: { FieldDate },
  } = useSchemaForm();
  return <FieldText {...props} FieldDate={FieldDate} />;
};

export default LinkedFieldText;
