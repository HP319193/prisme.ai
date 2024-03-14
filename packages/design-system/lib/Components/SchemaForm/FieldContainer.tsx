import { FC } from 'react';
import { useField } from 'react-final-form';
import { useSchemaForm } from './context';
import { FieldProps } from './types';

export const DefaultFieldContainer: FC<FieldProps> = ({
  children,
  className,
}) => {
  return <div className={`pr-form-field ${className}`}>{children}</div>;
};

export const FieldContainer: FC<FieldProps> = (props) => {
  const {
    components: { FieldContainer: C = DefaultFieldContainer },
  } = useSchemaForm();
  const field = useField(props.name);

  return (
    <C
      {...props}
      className={`${props.className} ${
        props.name !== 'values' && field.meta.dirty && field.meta.error
          ? 'pr-form-field--error'
          : ''
      }`}
    />
  );
};

export default FieldContainer;
