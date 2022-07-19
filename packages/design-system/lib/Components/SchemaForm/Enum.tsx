import { useMemo } from 'react';
import { useSchemaForm } from './context';
import { FieldProps } from './types';

export const Enum = (props: FieldProps) => {
  const {
    components: { FieldSelect },
  } = useSchemaForm();
  const options = useMemo(
    () =>
      (props.schema.enum && Array.isArray(props.schema.enum)
        ? props.schema.enum
        : []
      ).map((value, k) => ({
        label:
          (props.schema.enumNames && props.schema.enumNames[k]) || `${value}`,
        value,
      })),
    [props.schema]
  );
  if (!FieldSelect) return null;
  return <FieldSelect {...props} options={options} />;
};

export default Enum;
