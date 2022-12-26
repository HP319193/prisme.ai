import { useCallback, useState } from 'react';
import { useField } from 'react-final-form';
import { SchemaFormContext, useSchemaForm } from './context';
import { FieldProps } from './types';
import FieldContainer from './FieldContainer';
import Label from './Label';
import InfoBubble from './InfoBubble';
import { Input, Tooltip } from 'antd';
import { getError } from './utils';

export const FieldAny = ({
  JSONEditor,
  ...props
}: FieldProps & {
  JSONEditor: SchemaFormContext['components']['JSONEditor'];
}) => {
  const Editor = JSONEditor || Input.TextArea;
  const field = useField(props.name);
  const [value, setValue] = useState(
    typeof field.input.value === 'string'
      ? field.input.value
      : JSON.stringify(field.input.value, null, '  ')
  );
  const onChange = useCallback((value: string) => {
    setValue(value);
    try {
      const json = JSON.parse(value);
      field.input.onChange(json);
    } catch {
      field.input.onChange(value);
    }
  }, []);

  const hasError = getError(field.meta);

  return (
    <FieldContainer {...props} className="pr-form-any">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-any__label pr-form-label"
      >
        {props.label}
      </Label>
      <Tooltip title={hasError} overlayClassName="pr-form-error">
        <Editor
          className="pr-form-any__input pr-form-input"
          value={value}
          onChange={(e) => onChange(typeof e === 'string' ? e : e.target.value)}
          status={hasError ? 'error' : ''}
        />
      </Tooltip>
      <InfoBubble
        className="pr-form-any__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

const LinkedFieldAny = (props: FieldProps) => {
  const {
    components: { JSONEditor },
  } = useSchemaForm();

  return <FieldAny {...props} JSONEditor={JSONEditor} />;
};

export default LinkedFieldAny;
