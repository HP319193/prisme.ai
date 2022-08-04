import { useCallback, useState } from 'react';
import { useField } from 'react-final-form';
import { useSchemaForm } from './context';
import Description from './Description';
import { FieldProps } from './types';
import { getLabel } from './utils';

export const FieldAny = ({ schema, name, label }: FieldProps) => {
  const {
    components: { JSONEditor = 'textarea' },
  } = useSchemaForm();
  const field = useField(name);
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

  return (
    <div className="flex flex-1 flex-col my-2">
      <Description text={schema.description}>
        <label className="flex">
          {label || schema.title || getLabel(name)}
        </label>
        <JSONEditor
          className="flex flex-1 w-full outline-none"
          value={value}
          onChange={(e) => onChange(typeof e === 'string' ? e : e.target.value)}
        />
      </Description>
    </div>
  );
};
export default FieldAny;
