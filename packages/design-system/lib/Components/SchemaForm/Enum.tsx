import { useMemo } from 'react';
import { SchemaFormContext, useSchemaForm } from './context';
import { FieldProps } from './types';

export const Enum = ({
  FieldSelect,
  FieldRadio,
  ...props
}: FieldProps & {
  FieldSelect: SchemaFormContext['components']['FieldSelect'];
  FieldRadio: SchemaFormContext['components']['FieldRadio'];
}) => {
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

  if (props.schema['ui:widget'] === 'radio') {
    if (!FieldRadio) return null;
    return <FieldRadio {...props} options={options} />;
  }
  if (!FieldSelect) return null;
  return <FieldSelect {...props} options={options} />;
};

export const LinkedEnum = (props: FieldProps) => {
  const {
    components: { FieldSelect, FieldRadio },
  } = useSchemaForm();
  return <Enum {...props} FieldSelect={FieldSelect} FieldRadio={FieldRadio} />;
};

export default LinkedEnum;
