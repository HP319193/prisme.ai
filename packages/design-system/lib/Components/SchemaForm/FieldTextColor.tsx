import { useCallback, useRef } from 'react';
import { Input } from 'antd';
import { useField } from 'react-final-form';
import { useSchemaForm } from './context';
import Description from './Description';
import { FieldProps } from './types';
import { getLabel } from './utils';
import Color from 'color';

export const FieldTextColor = (props: FieldProps) => {
  const field = useField(props.name);
  const id = useRef(`${Math.random()}`);
  const { components } = useSchemaForm();

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
    <Description text={props.schema.description} className="flex items-center">
      <components.FieldContainer {...props}>
        <div>
          <Input
            {...field.input}
            id={id.current}
            onChange={onChange}
            type="color"
            className="!min-w-[5rem] !w-auto"
          />
          <label
            htmlFor={id.current}
            className="ml-2 p-2 !rounded-[0.3rem] text-black"
            style={{
              color: colorIsLight ? '' : field.input.value,
              backgroundColor: colorIsLight ? field.input.value : '',
            }}
          >
            {props.label || props.schema.title || getLabel(props.name)}
          </label>
        </div>
      </components.FieldContainer>
    </Description>
  );
};

export default FieldTextColor;
