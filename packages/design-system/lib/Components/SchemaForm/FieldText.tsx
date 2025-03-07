import { Input, Tooltip } from 'antd';
import { ChangeEvent, useCallback, useMemo } from 'react';
import { useField } from 'react-final-form';
import { SchemaFormContext, useSchemaForm } from './context';
import FieldAutocomplete from './FieldAutocomplete';
import DefaultFieldDate from './FieldDate';
import FieldTextColor from './FieldTextColor';
import FieldTextTextArea from './FieldTextTextArea';
import FieldTextPassword from './FieldTextPassword';
import FieldTextUpload from './FieldTextUpload';
import {
  FieldProps,
  UiOptionsCode,
  UIOptionsNumber,
  UiOptionsSlider,
  UiOptionsPassword,
  UiOptionsTextArea,
  UiOptionsUpload,
} from './types';
import { getError, getInputMode } from './utils';
import InfoBubble from './InfoBubble';
import { Label } from './Label';
import FieldContainer from './FieldContainer';
import FieldHTML from './FieldHTML';
import FieldSlider from './FieldSlider';

export const FieldText = ({
  FieldDate = DefaultFieldDate,
  FieldCode,
  ...props
}: FieldProps & {
  FieldDate: SchemaFormContext['components']['FieldDate'];
  FieldCode: SchemaFormContext['components']['FieldCode'];
}) => {
  const field = useField(props.name);
  const { 'ui:widget': uiWidget, 'ui:options': uiOptions } = props.schema;

  const hasError = getError(field.meta);

  const inputMode = getInputMode(props.schema);

  const inputProps = useMemo(() => {
    if (props.schema.type === 'number') {
      return (uiOptions as UIOptionsNumber)?.number;
    }
  }, [props, uiOptions]);

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
    case 'password':
      return (
        <FieldTextPassword
          {...props}
          options={(uiOptions || { pa: {} }) as UiOptionsPassword}
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
    case 'code':
      return FieldCode ? (
        <FieldCode
          {...props}
          options={(uiOptions || { code: {} }) as UiOptionsCode}
          data-testid={`schema-form-field-${field.input.name}`}
        />
      ) : null;
  }

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
          value={
            ['string', 'number'].includes(typeof field.input.value)
              ? `${field.input.value}`
              : ''
          }
          placeholder={props.schema.placeholder || ''}
          onChange={onChange}
          type={props.schema.type === 'number' ? 'number' : 'text'}
          disabled={props.schema.disabled}
          status={hasError ? 'error' : ''}
          className="pr-form-text__input pr-form-input"
          id={field.input.name}
          inputMode={inputMode}
          data-testid={`schema-form-field-${field.input.name}`}
          {...inputProps}
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
    components: { FieldDate, FieldCode },
  } = useSchemaForm();
  return <FieldText {...props} FieldDate={FieldDate} FieldCode={FieldCode} />;
};

export default LinkedFieldText;
