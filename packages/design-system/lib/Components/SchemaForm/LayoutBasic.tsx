import Field from './Field';
import { FieldProps } from './types';

export const LayoutBasic = ({ name, schema }: FieldProps) => {
  const { properties } = schema;

  if (!properties) return null;

  return (
    <>
      {Object.keys(properties).map((property) => (
        <div key={property} className="pr-form-object__property">
          <Field
            name={`${name}.${property}`}
            schema={{ disabled: schema.disabled, ...properties[property] }}
          />
        </div>
      ))}
    </>
  );
};
export default LayoutBasic;
