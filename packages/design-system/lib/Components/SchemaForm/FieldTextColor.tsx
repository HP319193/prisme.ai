import { useCallback, useRef } from 'react';
import { Input } from 'antd';
import { useField } from 'react-final-form';
import { FieldProps } from './types';
import { getLabel } from './utils';
import Color from 'color';
import InfoBubble from './InfoBubble';
import FieldContainer from './FieldContainer';

export const FieldTextColor = (props: FieldProps) => {
  const field = useField(props.name);

  const t = useRef<NodeJS.Timeout>();
  const onChange = useCallback(
    ({ target: { value } }) => {
      t.current && clearTimeout(t.current);
      t.current = setTimeout(() => {
        field.input.onChange(value);
      }, 100);
    },
    [field]
  );

  const colorIsLight = Color(field.input.value || 'black').isLight();

  return (
    <FieldContainer {...props} className="pr-form-text-color">
      <label
        htmlFor={field.input.name}
        className="pr-form-text-color__label pr-form-label"
        style={{
          color: colorIsLight ? '' : field.input.value,
          backgroundColor: colorIsLight ? field.input.value : '',
        }}
      >
        {props.label || props.schema.title || getLabel(props.name)}
      </label>
      <div className="pr-form-text-color__input pr-form-input">
        <Input
          {...field.input}
          id={field.input.name}
          onChange={onChange}
          type="color"
          data-testid={`schema-form-field-${field.input.name}`}
        />
      </div>
      <InfoBubble
        className="pr-form-text-color__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

export default FieldTextColor;
