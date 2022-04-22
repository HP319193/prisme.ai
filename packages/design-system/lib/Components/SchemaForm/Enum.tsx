import { useMemo } from 'react';
import { useSchemaForm } from './context';
import FieldSelect from './FieldSelect';
import { FieldProps } from './types';

export const Enum = (props: FieldProps) => {
  const { components } = useSchemaForm();
  const Component = components.FieldSelect || FieldSelect;
  const options = useMemo(
    () =>
      (props.schema.enum || []).map((value, k) => ({
        label:
          (props.schema.enumNames && props.schema.enumNames[k]) || `${value}`,
        value,
      })),
    []
  );
  return <Component {...props} options={options} />;
};

export default Enum;
