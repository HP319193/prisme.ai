import Field from './Field';
import { FieldProps } from './types';

export const LayoutBasic = ({ name, schema }: FieldProps) => {
  const { properties } = schema;

  if (!properties) return null;

  return (
    <>
      {Object.keys(properties).map((property) => (
        <Field
          key={property}
          name={`${name}.${property}`}
          schema={properties[property]}
        />
      ))}
    </>
  );
};
export default LayoutBasic;
