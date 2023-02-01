import { FC } from 'react';
import Field from './Field';
import { FieldProps } from './types';

const Container: FC<{
  hidden: boolean;
}> = ({ hidden, children }) => {
  if (hidden) return <>{children}</>;
  return <div className="pr-form-object__property">{children}</div>;
};

export const LayoutBasic = ({ name, schema }: FieldProps) => {
  const { properties } = schema;

  if (!properties) return null;

  return (
    <>
      {Object.entries(properties).map(([propertyName, property]) => (
        <Container key={propertyName} hidden={!!property.hidden}>
          <Field
            name={`${name}.${propertyName}`}
            schema={{ disabled: schema.disabled, ...property }}
          />
        </Container>
      ))}
    </>
  );
};
export default LayoutBasic;
